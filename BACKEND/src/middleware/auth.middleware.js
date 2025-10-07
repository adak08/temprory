import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import Admin from "../models/Admin.models.js";

/**
 *  General Authentication Middleware
 * Verifies JWT token, decodes role, and attaches user to req.user
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
    // Get token from Authorization header or cookies
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Authentication token is required");
    }

    try {
        // Verify access token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        let user;
        const role = decoded.role?.toLowerCase();

        // Identify model based on role
        if (["admin", "superadmin"].includes(role)) {
            user = await Admin.findById(decoded.id).select("-password");
        } else if (role === "staff") {
            user = await Staff.findById(decoded.id).select("-password");
        } else {
            user = await User.findById(decoded.id).select("-password");
        }

        if (!user) {
            throw new ApiError(401, "Invalid authentication token. User not found.");
        }

        // Attach user and role to request
        req.user = user;
        req.user.role = role;

        next();
    } catch (error) {
        console.error("Authentication Error:", error);

        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token has expired");
        }

        throw new ApiError(401, "Invalid or malformed authentication token");
    }
});

/**
 * 🧭 Admin-only Middleware
 * Ensures only admins or superadmins can access route
 */
export const adminOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (!["admin", "superadmin"].includes(req.user.role)) {
        throw new ApiError(403, "Admin access required");
    }

    next();
});

/**
 * 👷 Staff-only Middleware
 */
export const staffOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== "staff") {
        throw new ApiError(403, "Staff access required");
    }

    next();
});

/**
 * 🧩 Admin or Staff Access
 */
export const adminOrStaff = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (!["admin", "superadmin", "staff"].includes(req.user.role)) {
        throw new ApiError(403, "Admin or Staff access required");
    }

    next();
});

/**
 * 🛡️ Check Specific Permission (for Admins)
 * Example: router.post("/delete", authMiddleware, checkPermission("canDelete"), deleteHandler);
 */
export const checkPermission = (permission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (["admin", "superadmin"].includes(req.user.role) && req.user.permissions) {
            if (!req.user.permissions[permission]) {
                throw new ApiError(403, `Permission denied: ${permission} required`);
            }
            return next();
        }

        throw new ApiError(403, "Insufficient permissions");
    });
};

/**
 * ♻️ Refresh Token Middleware
 * Verifies refresh token and issues a new access token
 */
export const refreshTokenMiddleware = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const payload = { id: decoded.id, role: decoded.role };

        // Generate a new short-lived access token
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });

        res.status(200).json({
            success: true,
            message: "New access token generated successfully",
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.clearCookie("refreshToken");
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});
