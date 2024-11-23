const express = require('express');
const router = express.Router();

const {
    getReviews,
    getSingleReview,
    createReview,
    updateReview,
    deleteReview,
    getReviewsByPackageId // Add this line to import the function
} = require('../controllers/reviews');

// Public routes
router.get('/reviews/package/:packageId', getReviewsByPackageId); // Correctly reference getReviewsByPackageId
router.get('/admin/reviews', getReviews);
router.get('/review/:id', getSingleReview);

// Allow any user to create a review (no admin restriction)
router.post('/review/new', createReview);  // Regular users can create reviews

router.put('/review/:id', updateReview);

// Only admins can update and delete specific reviews (optional)
router.route('/admin/review/:id')
    .put(updateReview)
    .delete(deleteReview);

module.exports = router;
