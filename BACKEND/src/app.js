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
import staffIssueRoutes from "./routes/staff_issue.routes.js";
import adminIssueRoutes from "./routes/admin_issue.routes.js";  
import uploadRouter from "./routes/upload.routes.js";


// --- Utility Imports ---
import { ApiError } from './utils/ApiError.js'; 

const app = express();

// --- Path Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", ".."); 

console.log('🔧 Project Root:', projectRoot); // Add this for debugging

// --- CORS Configuration ---
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'null',
    undefined
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            console.error('CORS Error:', msg);
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors()); // Preflight OPTIONS requests

// Cookie Parser
app.use(cookieParser());

// Body Parsers
app.use(express.json({ limit: "50mb" })); // Increased limit for large payloads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- Serve frontend files and scripts ---
app.use(express.static(projectRoot)); 

// --- Request Logging Middleware ---
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
app.use("/api/upload", uploadRouter);
app.use("/api/staff_issues", staffIssueRoutes);
app.use("/api/admin_issues", adminIssueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

// 🔥 CRITICAL FIX: Use plural consistently
app.use("/api/user_issues", userIssueRoutes); // ✅ Changed to plural

// --- Health Check Endpoint ---
app.get("/api/health", (req, res) => {
    res.json({ 
        success: true,
        message: "Server is running healthy",
        timestamp: new Date().toISOString()
    });
});

// --- Debug Routes (Temporary) ---
app.get("/api/debug/routes", (req, res) => {
    res.json({
        availableRoutes: [
            "POST /api/users/signup",
            "POST /api/users/login", 
            "POST /api/staff/register",
            "POST /api/staff/login",
            "POST /api/admin/login",
            "POST /api/otp/request",
            "POST /api/otp/login/user",
            "POST /api/otp/login/staff", 
            "POST /api/otp/login/admin",
            "GET /api/user_issues"
        ]
    });
});

// --- Catch-all route for frontend ---
app.get("/", (req, res, next) => {
    const indexPath = path.join(projectRoot, "index.html");
    
    console.log('Serving index.html from:', indexPath);
    
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error(`Index.html not found at: ${indexPath}`);
            next(new ApiError(404, `Frontend file not found: ${indexPath}`));
        }
    });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// --- Global Error and 404 Handlers ---

// 404 Handler for unhandled API routes
app.all("/api", (req, res, next) => {
    next(new ApiError(404, `API Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`❌ ERROR: ${statusCode} - ${message}`, err.stack);

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

export default app;