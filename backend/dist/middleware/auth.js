import jwt from 'jsonwebtoken';
export const protect = async (req, res, next) => {
    let token;
    // Check for token in Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }
};
// Grant access to specific roles
export const authorize = (...roles) => {
    return async (req, res, next) => {
        // Here you would typically fetch the user from database
        // For now, we'll assume the role is stored in the token
        // You can enhance this by fetching user from DB
        // For demonstration, we'll just proceed
        // In production, fetch user and check role
        next();
    };
};
