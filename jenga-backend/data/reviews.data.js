const db = require("../config/firestore");
const { FieldValue } = require("firebase-admin/firestore");

const COLLECTION_NAME = "reviews";
const collection = db.collection(COLLECTION_NAME);

/**
 * Validates review data
 */
const validateReviewData = ({ rating, comment, bookingId }) => {
    const errors = [];
    if (!bookingId || typeof bookingId !== "string") {
        errors.push("bookingId is required and must be a string");
    }
    if (rating === undefined || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push("rating is required and must be an integer between 1 and 5");
    }
    if (comment !== undefined && typeof comment !== "string") {
        errors.push("comment must be a string");
    }
    if (errors.length) throw new Error(errors.join("; "));
};

/**
 * Creates a new review using a transaction
 * Updates service stats atomically
 */
const createReview = async (clientId, clientName, { bookingId, rating, comment }) => {
    if (!clientId) throw new Error("clientId is required");

    validateReviewData({ bookingId, rating, comment });
    const trimmedComment = comment ? comment.trim() : "";

    return await db.runTransaction(async (t) => {
        // 1. Fetch booking
        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingDoc = await t.get(bookingRef);

        if (!bookingDoc.exists) {
            throw new Error("Booking not found");
        }

        const booking = bookingDoc.data();

        // 2. Verify booking rules
        if (booking.clientId !== clientId) {
            throw new Error("Unauthorized: You can only review your own bookings");
        }
        if (booking.status !== "COMPLETED") {
            throw new Error("Reviews allowed only for COMPLETED bookings");
        }

        // 3. Check for existing review for this booking
        const existingReviewQuery = collection.where("bookingId", "==", bookingId).limit(1);
        const existingReviewSnapshot = await t.get(existingReviewQuery);

        if (!existingReviewSnapshot.empty) {
            throw new Error("Review already exists for this booking");
        }

        const serviceId = booking.serviceId;
        const providerId = booking.providerId;

        // 4. Fetch related service
        const serviceRef = db.collection("services").doc(serviceId);
        const serviceDoc = await t.get(serviceRef);

        if (!serviceDoc.exists) {
            // Technically possible if service hard deleted, but booking exists
            throw new Error("Service not found");
        }

        const service = serviceDoc.data();

        // 5. Calculate new stats
        const oldRatingAverage = service.ratingAverage || 0;
        const oldReviewsCount = service.reviewsCount || 0;
        const newReviewsCount = oldReviewsCount + 1;

        // Calculate new average: ((oldAvg * oldCount) + newRating) / newCount
        // Use floating point arithmetic
        const newRatingAverage = ((oldRatingAverage * oldReviewsCount) + rating) / newReviewsCount;

        // 6. Create review document
        const reviewRef = collection.doc();
        const reviewData = {
            bookingId,
            serviceId,
            providerId,
            clientId,
            clientName: clientName || booking.clientName || "Anonymous",
            rating,
            comment: trimmedComment,
            createdAt: FieldValue.serverTimestamp()
        };

        t.set(reviewRef, reviewData);

        // 7. Update service stats
        t.update(serviceRef, {
            ratingAverage: newRatingAverage,
            reviewsCount: newReviewsCount,
            updatedAt: FieldValue.serverTimestamp()
        });

        return { id: reviewRef.id, ...reviewData, ratingAverage: newRatingAverage };
    });
};

/**
 * Get reviews for a service
 */
const getReviewsForService = async (serviceId, options = {}) => {
    if (!serviceId) throw new Error("serviceId is required");

    const { limit = 10, startAfter = null } = options;
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);

    let query = collection
        .where("serviceId", "==", serviceId)
        .orderBy("createdAt", "desc");

    if (startAfter) {
        const lastDocSnapshot = await collection.doc(startAfter).get();
        if (!lastDocSnapshot.exists) {
            throw new Error("Invalid startAfter parameter");
        }
        query = query.startAfter(lastDocSnapshot);
    }

    const snapshot = await query.limit(parsedLimit + 1).get();
    const hasMore = snapshot.docs.length > parsedLimit;
    const docs = hasMore ? snapshot.docs.slice(0, parsedLimit) : snapshot.docs;

    const reviews = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return {
        reviews,
        hasMore,
        nextPageStartAfter: hasMore ? docs[docs.length - 1].id : null
    };
};

module.exports = {
    createReview,
    getReviewsForService
};
