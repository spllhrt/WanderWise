const Review = require('../models/reviews'); // Review model
const APIFeatures = require('../utils/apiFeatures'); // Utility for filtering and pagination
const BadWords = require('bad-words'); // Bad words filter
const filter = new BadWords();

// Add custom bad words to the filter
filter.addWords("Gago", "g4g0", "g@go", "Tanga", "t@ng@", "Putang Ina","tangina", "sarap", "pUtan9 In@", "Bobo", "b0b0", "Punyeta", "bw!s1t", "Landi", "Leche", "Salbahe", "Kupal", "Hudas", "Pangit", "T*ngina", "Baho", "Siraulo", "Abnoy", "Bastos", "Kalbo", "Chupa", "Matigas ang ulo", "Gaga", "Mamatay ka", "T*ngina mo", "Halimaw", "Pota", "Yawa", "Panget", "Bangkang", "Sablay", "Yuck", "Masahe", "ahole", "fuck", "shit", "asshole", "bitch", "slut", "dick", "cunt");

// Function to preprocess and filter comments
const preComment = comment => comment.replace(/[.,!?;()&%$#@]/g, '').toLowerCase();

// Get reviews by packageId
exports.getReviewsByPackageId = async (req, res) => {
    try {
        const { packageId } = req.params;
        const reviews = await Review.find({ packageId }).populate('userID', 'name'); // Populate user name

        if (!reviews.length) {
            return res.status(404).json({ message: 'No reviews found for this package.' });
        }

        res.status(200).json({
            success: true,
            reviews,
            reviewsCount: reviews.length,
        });
    } catch (error) {
        console.error('Error fetching reviews by packageId:', error);
        res.status(500).json({ message: 'Error loading reviews.', error: error.message });
    }
};

// Get all reviews for admin
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find();

        if (!reviews.length) {
            return res.status(404).json({ success: false, message: 'No reviews found.' });
        }

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Error loading reviews.', error: error.message });
    }
};

// Get single review
exports.getSingleReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Create new review
exports.createReview = async (req, res) => {
    try {
        const { userID, packageId, comments, ratings } = req.body;

        if (!ratings || !comments) {
            return res.status(400).json({ message: 'Rating and comments are required.' });
        }

        const filteredComment = filter.clean(preComment(comments)); // Filter bad words in comments

        const newReview = new Review({
            userID,
            packageId,
            comments: filteredComment,
            ratings,
        });

        await newReview.save();

        res.status(201).json({ message: 'Review submitted successfully.', review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        const { comments, ratings, packageId } = req.body;

        if (comments) review.comments = filter.clean(preComment(comments));
        if (ratings) review.ratings = ratings;
        if (packageId) review.packageId = packageId;

        await review.save();

        res.status(200).json({ success: true, review });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        res.status(200).json({ success: true, message: 'Review deleted.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Add a review (with bad words filtering)
exports.addReview = async (req, res) => {
    try {
        const { product, rating, comment } = req.body;

        if (!product || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const filteredComment = filter.clean(preComment(comment));

        const review = new Review({
            user: req.user._id,
            product,
            rating,
            comment: filteredComment,
        });

        await review.save();

        res.status(201).json({ message: 'Review added successfully!', review });
    } catch (error) {
        console.error('Error adding review:', error.message);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
