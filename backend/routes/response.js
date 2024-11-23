const express = require('express');
const router = express.Router();

const {
    getResponses,
    getSingleResponse,
    createResponse,
    updateResponse,
    deleteResponse,
} = require('../controllers/response');
// const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.get('/responses', getResponses);
router.get('/response/:id', getSingleResponse);

// Admin routes for creating, updating, and deleting responses
router.post('/admin/response/new', createResponse);
router.route('/admin/response/:id')
    .patch(updateResponse) // Use patch for updates
    .delete(deleteResponse); // Delete a response

module.exports = router;
