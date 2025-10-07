import express from "express";
import {
    handleGetStaffComplaints,
    handleUpdateStaffComplaint,
    handleGetStaffStats
} from "../controllers/staff_issue.controllers.js";
import { authMiddleware,staffOnly } from "../middleware/auth.middleware.js";

const router=express.Router();

router.get("/",authMiddleware,staffOnly,handleGetStaffComplaints);
router.put("/:id",authMiddleware,staffOnly,handleUpdateStaffComplaint);
router.get("/stats",authMiddleware,staffOnly,handleGetStaffStats);

export default router;
