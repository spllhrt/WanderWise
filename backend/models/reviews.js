// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userID: {  // Changed to match your controller
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    comments: {
        type: String,
        required: true,
        maxlength: 500,
    },
    images: [
        {
            public_id: String,
            url: String,
        }
    ],
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
