const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    getCategories, 
    getSingleCategory,
    getAdminCategories,
    deleteCategory,
    newCategory,
    updateCategory,
} = require('../controllers/category');
// const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/categories', getCategories);
router.get('/category/:id', getSingleCategory);
router.get('/admin/categories', getAdminCategories);
router.route('/admin/category/:id')
    .delete(deleteCategory)
    .put(upload.array('images', 10), updateCategory); // Add upload middleware here

router.post('/admin/category/new', upload.array('images', 10), newCategory);

module.exports = router;
