import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import Admin from "../models/Admin.models.js";

// General authentication middleware
export const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Authentication token is required");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user from appropriate model based on role
        let user;
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id).select('-password');
        } else if (decoded.role === 'staff') {
            user = await Staff.findById(decoded.id).select('-password');
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user) {
            throw new ApiError(401, "Invalid authentication token");
        }

        req.user = user;
        req.user.role = decoded.role;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token has expired");
        }
        throw new ApiError(401, "Invalid authentication token");
    }
});

// Admin-only middleware
export const adminOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Admin access required");
    }

    next();
});

// Staff-only middleware
export const staffOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== 'staff') {
        throw new ApiError(403, "Staff access required");
    }

    next();
});

// Admin or Staff middleware
export const adminOrStaff = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (!['admin', 'staff'].includes(req.user.role)) {
        throw new ApiError(403, "Admin or Staff access required");
    }

    next();
});

// Check specific permissions (for admin)
export const checkPermission = (permission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (req.user.role === 'admin' && req.user.permissions) {
            if (!req.user.permissions[permission]) {
                throw new ApiError(403, `Permission denied: ${permission} required`);
            }
            return next();
        }

        throw new ApiError(403, "Insufficient permissions");
    });
};

// Refresh token middleware
export const refreshTokenMiddleware = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Generate new access token
        const payload = { id: decoded.id, role: decoded.role };
        const newAccessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});