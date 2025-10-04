import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";

// --- Route Imports ---
import userRoutes from "./routes/user.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import notificationRoutes from './routes/notification.routes.js';
import chatRoutes from "./routes/chat.routes.js";
import userIssueRoutes from "./routes/user_issue.routes.js";

// --- Utility Imports ---
import { ApiError } from './utils/ApiError.js'; 

const app = express();

// CRITICAL UPDATE: Allowing 'null' origin for local file system access and certain browser environments.
const allowedOrigins = [
    'http://127.0.0.1:5500', // VS Code Live Server default
    'http://localhost:5500',
    'http://localhost:3000',  // Backend server itself
    'http://127.0.0.1:3000',
    'null', // string 'null' for CORS header, not JS null
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow 'null' origin (file://) for local dev
        if (origin === 'null') return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            console.error(msg);
            return callback(new Error(msg), false);
        }
    },
    credentials: true
}));

// Cookie Parser: Used to parse cookies attached to the client request (essential for refresh tokens)
app.use(cookieParser());

// Body Parsers: Configure Express to handle incoming data formats
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// --- Serve frontend files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets (html, css, js, etc.) from BACKEND root
app.use(express.static(path.join(__dirname, "../../")));

// --- API Routes ---
// app.use("/api/users", userRoutes);       // User signup/login
// app.use("/api/staff", staffRoutes);      // Staff registration/login
// app.use("/api/admin", adminRoutes);      // Admin login
app.use("/api/otp", otpRoutes);          // OTP request/verification
app.use("/api/notifications", notificationRoutes); // Notification management
app.use("/api/chat", chatRoutes);        // Chat/messaging functionality
app.use("/api/user_issues", userIssueRoutes); // User issues/complaints

// --- Health Check Endpoint ---
app.get("/health", (req, res) => {
    res.json(`Server is running healthy`);
});

// --- Catch-all route for frontend (default index.html) ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../index.html"));
});

// --- Global Error and 404 Handlers ---
// 404 Handler for unhandled routes (should be the last route handler)
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`ERROR CATCHED: ${statusCode} - ${message}`, err.stack);

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

export default app;
