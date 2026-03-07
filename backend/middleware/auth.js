const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Token is sent in request headers as:
        // Authorization: Bearer eyJhbGc...
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        // Verify token using your secret key
        // If expired or tampered — this throws an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user ID to request object so routes can use it
        req.userId = decoded.userId;

        // Pass control to the next handler (the actual route)
        next();

    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;