import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        match: /^[0-9]{10}$/
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    role: {
        type: String,
        enum: ["admin","superadmin"],
        default: "admin"
    },
    profileImage: {
        type: String
    },
    permissions: {
        canAssign: {
            type: Boolean,
            default: true  // Changed to true by default for all admins
        },
        canResolve: {
            type: Boolean,
            default: true
        },
        canDelete: {
            type: Boolean,
            default: true  // Changed to true by default for all admins
        },
        canManageStaff: {
            type: Boolean,
            default: true  // New permission: manage staff members
        },
        canManageDepartments: {
            type: Boolean,
            default: true  // New permission: manage departments
        },
        canSendBulkNotifications: {
            type: Boolean,
            default: true  // New permission: send bulk notifications
        },
        canViewReports: {
            type: Boolean,
            default: true  // New permission: view system reports
        },
        canManageAdmins: {
            type: Boolean,
            default: false  // Can create/edit other admins (only senior admins)
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// // Index for faster queries
// adminSchema.index({ email: 1 });
// adminSchema.index({ phone: 1 });
// adminSchema.index({ isActive: 1 });

// Method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
    return this.permissions[permission] === true;
};

// Method to update last login
adminSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

export default mongoose.model("Admin", adminSchema);