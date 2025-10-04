import mongoose from "mongoose";
import http from 'http';
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from "./app.js";
import { initIo } from "./utils/notificationHandler.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        const server = http.createServer(app);

        // Initialize Socket.IO
        initIo(server);

        server.listen(PORT, () => {
            console.log(`✅ Server is running at http://localhost:${PORT}`);
        });

    })
    .catch((err) => {
        console.log("❌ MONGO db connection failed !!!", err);
        process.exit(1);
    });
