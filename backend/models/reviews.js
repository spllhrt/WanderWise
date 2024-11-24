// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    comments: { type: String, required: true, trim: true },
    ratings: { type: Number, required: true, min: 1, max: 5 }, // Ensure rating is stored here
    createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
