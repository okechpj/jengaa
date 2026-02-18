const reviewsData = require("../data/reviews.data");

/**
 * POST /reviews
 * Create a new review
 */
const createReview = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ success: false, error: "Authentication required" });
        }

        const clientId = req.user.uid;
        const clientName = req.user.name;

        const { bookingId, rating, comment } = req.body;

        const review = await reviewsData.createReview(clientId, clientName, {
            bookingId,
            rating,
            comment
        });

        return res.status(201).json({ success: true, data: review });

    } catch (err) {
        const msg = err.message || "Error creating review";

        if (msg.includes("Authentication required") || msg.includes("Unauthorized")) {
            return res.status(403).json({ success: false, error: msg });
        }
        if (msg.includes("Booking not found") || msg.includes("Service not found")) {
            return res.status(404).json({ success: false, error: msg });
        }
        if (msg.includes("Review already exists")) {
            return res.status(409).json({ success: false, error: msg });
        }

        return res.status(400).json({ success: false, error: msg });
    }
};

/**
 * GET /services/:serviceId/reviews
 * Get reviews for a service
 */
const getReviewsForService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { limit = 10, startAfter = null } = req.query;

        const result = await reviewsData.getReviewsForService(serviceId, {
            limit: parseInt(limit),
            startAfter
        });

        return res.json({
            success: true,
            data: result.reviews,
            pagination: {
                limit: parseInt(limit) || 10,
                hasMore: result.hasMore,
                nextPageStartAfter: result.nextPageStartAfter
            }
        });

    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

module.exports = {
    createReview,
    getReviewsForService
};
