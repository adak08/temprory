import Admin from "../models/Admin.models.js";
import bcrypt from "bcryptjs"; // ADD THIS IMPORT
import jwt from "jsonwebtoken"; // ADD THIS IMPORT
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

export const adminLogin = async(req, res) => {
    try {
        const { adminId, password } = req.body;

        console.log('[ADMIN LOGIN] Received:', { adminId, password: '***' });

        if (!adminId || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Please provide adminId and password" 
            });
        }

        // Find admin by email or phone
        const admin = await Admin.findOne({
            $or: [{ email: adminId }, { phone: adminId }],
        });
        
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: "Admin not found or Invalid Credentials" 
            });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid Credentials" 
            });
        }

        const payload = { id: admin._id, role: admin.role };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        // FIXED RESPONSE FORMAT - Match what frontend expects
        res.status(200).json({
            success: true,
            message: "Admin Login Successful",
            accessToken, // Direct accessToken (not nested in data)
        });
    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server Error during admin login." 
        });
    }
};