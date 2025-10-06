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

// --- Path Configuration ---
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // .../BACKEND/src
// CRITICAL FIX: Go up two levels to reach the project root (TEMPRORY/) 
// if index.html and scripts/ are siblings of the BACKEND folder.
const projectRoot = path.join(__dirname, "..", ".."); 

// CRITICAL UPDATE: Allowing 'null' origin for local file system access and certain browser environments.
const allowedOrigins = [
    'http://127.0.0.1:5500', // VS Code Live Server default
    'http://localhost:5500',
    'http://localhost:3000',  // Backend server itself
    'http://127.0.0.1:3000',
    'null', // string 'null' for CORS header, not JS null, for file:// access
    undefined // Allow non-browser requests (like curl, tools, or local file access without origin header)
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or direct file access)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Check if the origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            // console.error(msg); // Commenting out to reduce log spam unless in dev environment
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

// --- Serve frontend files and scripts ---
// Serve the project root (TEMPRORY/) which contains index.html, scripts/, and stylesheets/
app.use(express.static(projectRoot)); 

// --- API Routes ---
app.use("/api/users", userRoutes);       // User signup/login (Password)
app.use("/api/staff", staffRoutes);      // Staff registration/login (Password)
app.use("/api/admin", adminRoutes);      // Admin login (Password)
app.use("/api/otp", otpRoutes);          // OTP request/verification/Signup/Login
app.use("/api/notifications", notificationRoutes); // Notification management
app.use("/api/chat", chatRoutes);        // Chat/messaging functionality
app.use("/api/user_issues", userIssueRoutes); // User issues/complaints

// --- Health Check Endpoint ---
app.get("/api/health", (req, res) => {
    res.json(`Server is running healthy`);
});

// --- Catch-all route for frontend (default index.html) ---
app.get("/", (req, res, next) => {
    const indexPath = path.join(projectRoot, "index.html");
    
    // Attempt to serve index.html from the calculated project root directory
    res.sendFile(indexPath, (err) => {
        if (err) {
            // If the file is not found, log the error and pass it to the error handler
            console.error(`Attempted path: ${indexPath}. File not found.`);
            next(new ApiError(404, `Frontend file (index.html) not found in the expected location: ${indexPath}`));
        }
    });
});

// Handle favicon requests to avoid noisy 404 errors in logs when a favicon is not present
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// --- Global Error and 404 Handlers ---
// 404 Handler for unhandled API routes
// FIX: Changed "/api/*" to "/api" + standard wildcard regex pattern (.*)
app.use("/api", (req, res, next) => {
    next(new ApiError(404, `API Route not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error details only in development
    if (process.env.NODE_ENV === "development") {
        console.error(`ERROR CATCHED: ${statusCode} - ${message}`, err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

export default app;
