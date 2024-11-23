const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    getPackages, 
    getSinglePackage,
    getAdminPackages,
    deletePackage,
    newPackage,
    updatePackage,
} = require('../controllers/package');

router.get('/packages', getPackages);

router.get('/package/:id', getSinglePackage);

router.get('/admin/packages', getAdminPackages);

router.route('/admin/package/:id')
    .delete(deletePackage)
    .put(upload.array('images', 10), updatePackage);

router.post('/admin/package/new', upload.array('images', 10), newPackage);

module.exports = router;