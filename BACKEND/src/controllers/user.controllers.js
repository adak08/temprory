import User from "../models/User.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userSignup = async(req, res) => {
    try {
        const { name, email, password, phone, street, city, state, pincode } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false,
                message: "Please fill all required fields: name, email, password, phone." 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Email already registered" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address: {
                street,
                city,
                state,
                pincode,
            },
        });

        await newUser.save();

        // Generate tokens immediately after signup
        const payload = { id: newUser._id, role: newUser.role || "user" };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            data: {
                accessToken,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role
                }
            }
        });
    } catch (err) {
        console.error("User Signup Error: ", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: err.message || "Validation failed for one or more fields." 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Server Error" 
        });
    }
};

// FIXED: Accept 'identifier' instead of 'email'
export const userLogin = async(req, res) => {
    try {
        // Frontend sends 'identifier' and 'password'
        const { identifier, password } = req.body;
        
        console.log('[USER LOGIN] Received:', { identifier, password: '***' });

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Please provide identifier and password" 
            });
        }

        // Find user by email or phone
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid Credentials" 
            });
        }

        // Generate JWT
        const payload = { id: user._id, role: user.role || "user" };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        // Send refresh token as HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                }
            }
        });
    } catch (err) {
        console.error("User login error: ", err);
        res.status(500).json({ 
            success: false,
            message: "Server Error" 
        });
    }
};