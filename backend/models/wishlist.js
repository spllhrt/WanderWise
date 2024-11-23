const mongoose = require('mongoose');


const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user ID for the wishlist item'],
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package', // Assuming you have a Package model
        required: [true, 'Please provide package ID for the wishlist item'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model('Wishlist', wishlistSchema);


