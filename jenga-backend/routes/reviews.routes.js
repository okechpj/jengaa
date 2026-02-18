const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { authenticate, requireClient } = require("../middleware/auth");

/**
 * POST /reviews
 * Create a new review (Authenticated Client only)
 */
router.post("/", authenticate, requireClient, reviewsController.createReview);

/**
 * GET /reviews/services/:serviceId
 * Get reviews for a service (Public or strictly authenticated? Spec says 'Get Reviews for Service (GET /services/:id/reviews)', 
 * but since we are mounting at /reviews, it should probably be /reviews/services/:serviceId or the user meant mounting at /services/:id/reviews. 
 * The plan says `GET /services/:serviceId` inside `reviews.routes.js` and mount `reviewsRoutes` at `/reviews`.
 * So `GET /reviews/services/:serviceId` seems correct based on "Mount reviewsRoutes at /reviews" in plan.
 * But user request said: "Get Reviews for Service (GET /services/:id/reviews)".
 * I will stick to the plan which likely meant:
 * App mounts /reviews -> reviews.routes.js
 * reviews.routes.js has /services/:serviceId -> combined: /reviews/services/:serviceId
 *
 * WAIT. The user request "GET /services/:id/reviews" likely implies it should be under service routes or we should structure it to match that path.
 * However, keeping it in reviews.routes.js is cleaner code-wise. 
 * I will implement `GET /services/:serviceId` here, so the full path is `/reviews/services/:serviceId`.
 * 
 * Re-reading user request: "GET /services/:id/reviews". This is a sub-resource of services.
 * But I can also add a route /:serviceId/reviews in services.routes.js that calls reviewsController.
 * OR I can just expose /reviews?serviceId=... 
 * 
 * The user plan says: `GET /services/:serviceId - Get reviews for a service.` inside `reviews.routes.js`.
 * And `Mount reviewsRoutes at /reviews`.
 * So the result is `GET /reviews/services/:serviceId`.
 * I will stick to this for now as it separates concerns, unless I strictly need `GET /services/:id/reviews`.
 * 
 * Actually, to be arguably more RESTful and follow the user's "GET /services/:id/reviews" exactly, I would need to modify `service.routes.js`.
 * But I will implement strictly what was in the APPROVED plan: `GET /services/:serviceId` in `reviews.routes.js`.
 */
router.get("/services/:serviceId", reviewsController.getReviewsForService);

module.exports = router;
