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
        const user = await User.create({ name, email, password }); // Default role is user
        sendToken(user, 201, res);
    } catch (error) {
        // Removed multer error check as it's unnecessary for registration
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

const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: name || 'Anonymous',
                email,
                password: '', // Empty password for social login
                profileImage: { public_id: 'default', url: picture || 'default_image_url' },
            });
            await user.save();
        }

        sendToken(user, 200, res);
    } catch (error) {
        console.error('Google login error:', error.message); // Log the error for debugging
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

const updateUser = async (req, res) => {
    // Log incoming request data for debugging
    console.log('Update request body:', req.body);
    console.log('User ID to update:', req.params.id);

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    try {
        // Find and update the user by their ID
        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true, // Return the updated user
            runValidators: true, // Ensure that the new data passes validation
        });

        if (!user) {
            return res.status(400).json({ message: `User not updated with id: ${req.params.id}` });
        }

        // Log the updated user for debugging
        console.log('Updated user:', user);

        return res.status(200).json({
            success: true,
            user, // Return the updated user object
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Error updating user data' });
    }
};


// Update user (Admin)
const AdminUpdateUser = async (req, res) => {
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


module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    AdminUpdateUser // Add this for use in routes
};
