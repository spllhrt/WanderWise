const express = require('express');
const router = express.Router();
// const upload = require("../utils/multer"); // Uncomment if you need file upload functionality


const {
    createWishlistItem,
    getWishlistItems,       // Ensure this is defined and correctly imported from your controller
    getSingleWishlistItem,
    updateWishlistItem,     // Add this in the controller if not already defined
    deleteWishlistItem,
} = require('../controllers/wishlist');
// Uncomment the line below if you have authentication middleware
// const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');


// Public routes
router.get('/wishlist', getWishlistItems);
router.get('/wishlist/:id', getSingleWishlistItem);


// Admin routes for creating, updating, and deleting wishlist items
router.post('/admin/wishlist/new', createWishlistItem);
router.get('/admin/wishlist/:id', getSingleWishlistItem);
router.patch('/admin/wishlist/:id', updateWishlistItem);
router.route('/admin/wishlist/:id')
    .patch(updateWishlistItem)
    .delete(deleteWishlistItem);


module.exports = router;
