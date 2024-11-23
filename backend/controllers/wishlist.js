const Wishlist = require('../models/wishlist'); // Import Wishlist model
const APIFeatures = require('../utils/apiFeatures'); // Assuming you have pagination and filtering utilities


// Get all wishlist items for a user
exports.getWishlistItems = async (req, res) => {
    try {
        const resPerPage = 10;
        const wishlistCount = await Wishlist.countDocuments();
        const apiFeatures = new APIFeatures(Wishlist.find({ userId: req.params.userId }), req.query).filter().pagination(resPerPage);
        const wishlistItems = await apiFeatures.query;


        if (!wishlistItems.length) {
            return res.status(400).json({ message: 'No wishlist items found' });
        }


        const filteredWishlistCount = wishlistItems.length;


        return res.status(200).json({
            success: true,
            wishlistItems,
            filteredWishlistCount,
            resPerPage,
            wishlistCount,
        });
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading wishlist items',
            error: error.message,
        });
    }
};


// Get a single wishlist item by ID
exports.getSingleWishlistItem = async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findById(req.params.id);
        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found',
            });
        }


        return res.status(200).json({
            success: true,
            wishlistItem,
        });
    } catch (error) {
        console.error('Error fetching wishlist item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};


// Add an item to the wishlist
exports.createWishlistItem = async (req, res) => {
    try {
        const { userId, packageId } = req.body;


        if (!userId || !packageId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both userId and packageId',
            });
        }


        const wishlistItem = await Wishlist.create({ userId, packageId });


        return res.status(201).json({
            success: true,
            wishlistItem,
        });
    } catch (error) {
        console.error('Error creating wishlist item:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating wishlist item',
            error: error.message,
        });
    }
};


// Update a wishlist item (if needed)
exports.updateWishlistItem = async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findById(req.params.id);
        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found',
            });
        }


        const { packageId } = req.body;


        if (packageId) wishlistItem.packageId = packageId;


        await wishlistItem.save();


        return res.status(200).json({
            success: true,
            wishlistItem,
        });
    } catch (error) {
        console.error('Update wishlist item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};


// Delete a wishlist item
exports.deleteWishlistItem = async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findByIdAndDelete(req.params.id);
        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found',
            });
        }


        return res.status(200).json({
            success: true,
            message: 'Wishlist item deleted',
        });
    } catch (error) {
        console.error('Delete wishlist item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
