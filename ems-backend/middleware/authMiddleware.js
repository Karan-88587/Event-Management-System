const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');

// Middleware to authenticate requests
const authMiddleware = async (req, res, next) => {
    
    const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"
    // console.log("Token :", token);

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("Decoded Token :", decoded);

        // Find the user by ID and check if the token matches
        const user = await User.findById(decoded.userId);
        if (!user || user.accessToken !== token) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Attach the user ID to the request object
        req.userId = user._id;
        next();
        
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

module.exports = authMiddleware;