import express from "express";
import { 
    handleFetchAllUserIssues, 
    handleFetchStaffList,      
    handleUpdateIssue,
    handleGetComplaintDetails,
    handleBulkAssign
} from "../controllers/admin_issue.controllers.js"; 
import { authMiddleware, adminOnly } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, adminOnly, handleFetchAllUserIssues);

router.get("/staff", authMiddleware, adminOnly, handleFetchStaffList);

router.get("/:id", authMiddleware, adminOnly, handleGetComplaintDetails);
router.put("/:id", authMiddleware, adminOnly, handleUpdateIssue);
router.post("/bulk-assign", authMiddleware, adminOnly, handleBulkAssign);
export default router;