const User = require('../models/user');
const sendToken = require('../utils/jwtToken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('../utils/multer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;


    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please enter email and password' });
    }

    try {
        const user = await User.create({ name, email, password, role: 'user' }); // Default role is user
        sendToken(user, 201, res);
    } catch (error) {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `Multer Error: ${error.message}` });
        }
        res.status(400).json({ error: error.message });
    }
};


// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' });
    }

    let user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    sendToken(user, 200, res);
};

// Google Login
// Google Login
const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // This should match your Google Client ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new user
            user = new User({
                name: name || 'Anonymous',
                email,
                password: '', // No password needed for Google login
                profileImage: picture || 'default_image_url',
            });
            await user.save();
        }

        // Send back user data (role, profile, etc.)
        sendToken(user, 200, res);  // Generate JWT and send response
    } catch (error) {
        res.status(500).json({ message: 'Google login failed. Please try again later.' });
    }
};



// Get all users (Admin)
const allUsers = async (req, res) => {
    const users = await User.find();
    if (!users || users.length === 0) {
        return res.status(400).json({ error: 'No users found' });
    }
    return res.status(200).json({
        success: true,
        users,
    });
};

// Get user details by ID
const getUserDetails = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(400).json({ message: `User not found with id: ${req.params.id}` });
    }
    return res.status(200).json({
        success: true,
        user,
    });
};

// Update user (Admin)
const updateUser = async (req, res) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return res.status(400).json({ message: `User not updated with id: ${req.params.id}` });
    }

    return res.status(200).json({
        success: true,
        user,
    });
};

// Delete user (Admin)
const deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    return res.status(200).json({
        success: true,
        message: 'User deleted',
    });
};

// User registration route with file upload (multer middleware used)
const uploadProfileImage = multer.single('profileImage'); // Field name for file upload

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    uploadProfileImage // Add this for use in routes
};
