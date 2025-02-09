const router = require('express').Router();
const User = require('../model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    
    const { firstName, middleName, lastName, mobileNo, email, password } = req.body;
    
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            middleName,
            lastName,
            mobileNo,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });

        // Update the user's accessToken field
        newUser.accessToken = token;
        await newUser.save();

        const registeredUser = await User.findById(newUser._id).select('-password -accessToken');
        // console.log("Registered User :", registeredUser);

        // Return the token and user details (excluding password)
        return res.status(200).json({
            result: true,
            message: 'User registered successfully',
            token,
            data: registeredUser
        });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error creating user', error: error });
    }
});

router.post('/login', async (req, res) => {
    
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });

        // Update the user's accessToken field
        user.accessToken = token;
        await user.save();

        const loggedInUser = await User.findById(user._id).select('-password -accessToken');
        // console.log("Logged In User :", loggedInUser);

        // Return the token and user details (excluding password)
        return res.status(200).json({
            result: true,
            message: 'User logged in successfully',
            token,
            data: loggedInUser
        });
        
    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error logging in user', error: error });
    }
});

router.post('/logout', authMiddleware, async (req, res) => {
    
    const userId = req.userId;

    try {
        // Find the user by ID and clear the accessToken
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.accessToken = null;
        await user.save();

        return res.status(200).json({ result: true, message: 'User logged out successfully' });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Something went wrong', error: error });
    }
});

module.exports = router;