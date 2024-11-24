const express = require('express');
const passport = require('passport');
const upload = require('../config/multer');
const { 
    registerUser, 
    loginUser, 
    googleLogin, 
    allUsers, 
    getUserDetails, 
    AdminUpdateUser,
    updateUser, 
    deleteUser 
} = require('../controllers/auth');

const router = express.Router();

router.post('/register',registerUser);
router.put('/user/:id', updateUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

router.get('/admin/users', allUsers);
router.route('/admin/user/:id')
    .get(getUserDetails)
    .put(AdminUpdateUser)
    .delete(deleteUser);

module.exports = router;
