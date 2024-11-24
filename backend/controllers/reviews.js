const Review = require('../models/reviews'); // Review model
const APIFeatures = require('../utils/apiFeatures'); // Assuming you have a utility for filtering and pagination

// Get reviews by packageId
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
        const reviews = await Review.find(); // Corrected model name from Reviews to Review
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No reviews found',
            });
        }
        return res.status(200).json({
            success: true,
            reviews
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
        const { userID, packageId, comments, ratings } = req.body;

        if (!ratings || !comments) {
            return res.status(400).json({ message: 'Rating and comments are required' });
        }

        const newReview = new Review({
            userID,
            packageId,
            comments,
            ratings, // Save the ratings field to the database
        });

        await newReview.save();

        res.status(200).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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
