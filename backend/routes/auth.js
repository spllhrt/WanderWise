const express = require('express');
const passport = require('passport');
const upload = require('../config/multer');
const { 
    registerUser, 
    loginUser, 
    googleLogin, 
    allUsers, 
    getUserDetails, 
    updateUser, 
    deleteUser 
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

router.get('/admin/users', allUsers);
router.route('/admin/user/:id')
    .get(getUserDetails)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
