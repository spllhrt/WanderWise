const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: [true, 'Review ID is required for the response'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'User ID is required for the response'],
    },
    comments: {
        type: String,
        required: [true, 'Please provide a comment for the response'],
        trim: true,
        maxLength: [500, 'Response cannot exceed 500 characters'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Response', responseSchema);
