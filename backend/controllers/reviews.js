const Review = require('../models/reviews'); // Review model
const APIFeatures = require('../utils/apiFeatures'); // Assuming you have a utility for filtering and pagination

exports.getReviewsByPackageId = async (req, res) => {
    try {
        const { packageId } = req.params;

        // Fetch reviews and populate the userID field (specifically the 'name' field)
        const reviews = await Review.find({ packageId })
            .populate('userID', 'name');  // Populate the 'name' field of the User model

        if (!reviews.length) {
            return res.status(400).json({ message: 'No reviews found for this package' });
        }

        return res.status(200).json({
            success: true,
            reviews,
            reviewsCount: reviews.length,
        });
    } catch (error) {
        console.error('Error fetching reviews by packageId:', error);
        return res.status(500).json({ success: false, message: 'Error loading reviews', error: error.message });
    }
};

// Get all reviews for admin
exports.getReviews = async (req, res) => {
    try {
        const resPerPage = 4;
        const reviewsCount = await Review.countDocuments();
        const apiFeatures = new APIFeatures(Review.find(), req.query).search().filter();
        apiFeatures.pagination(resPerPage);
        const reviews = await apiFeatures.query;

        if (!reviews.length) {
            return res.status(400).json({ message: 'No reviews found' });
        }

        const filteredReviewsCount = reviews.length;

        return res.status(200).json({
            success: true,
            reviews,
            filteredReviewsCount,
            resPerPage,
            reviewsCount,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading reviews',
            error: error.message,
        });
    }
};

// Get single review
exports.getSingleReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(200).json({
            success: true,
            review,
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// Create new review
exports.createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);

        return res.status(201).json({
            success: true,
            review,
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating review',
            error: error.message,
        });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        if (req.body.comments) {
            review.comments = req.body.comments;
        }

        if (req.body.ratings) {
            review.ratings = req.body.ratings; // Update the ratings
        }

        if (req.body.packageId) {
            review.packageId = req.body.packageId; // Update the packageId
        }

        await review.save();

        return res.status(200).json({
            success: true,
            review,
        });
    } catch (error) {
        console.error('Update review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Review deleted',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
