import Staff from "../models/Staff.models.js";

export const staffRegister = async(req, res) => {
    try {
        const { name, email, password, phone, staffId } = req.body;
        
        if (!name || !email || !password || !staffId) {
            return res.status(400).json({ 
                success: false,
                message: "Please fill all required fields for staff registration." 
            });
        }
        
        const existingStaff = await Staff.findOne({ $or: [{ email }, { staffId }] });
        if (existingStaff) {
            return res.status(400).json({ 
                success: false,
                message: "Email or Staff ID already registered." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = new Staff({
            name,
            email,
            password: hashedPassword,
            phone,
            staffId,
            role: "staff"
        });
        
        await newStaff.save();

        // Generate tokens immediately after registration
        const payload = { id: newStaff._id, role: newStaff.role || "staff" };
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
            message: "Staff registered successfully.",
            data: {
                accessToken,
                staff: {
                    id: newStaff._id,
                    name: newStaff.name,
                    email: newStaff.email,
                    staffId: newStaff.staffId,
                    role: newStaff.role
                }
            }
        });
    } catch (err) {
        console.error("Staff registration error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server Error during staff registration" 
        });
    }
};

// FIXED: Accept 'identifier' instead of 'staffIdOrEmail'
export const staffLogin = async(req, res) => {
    try {
        // Frontend sends 'identifier' and 'password'
        const { identifier, password } = req.body;
        
        console.log('[STAFF LOGIN] Received:', { identifier, password: '***' });

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Please provide identifier and password" 
            });
        }

        const staff = await Staff.findOne({
            $or: [{ email: identifier }, { staffId: identifier }],
        });
        
        if (!staff) {
            return res.status(404).json({ 
                success: false,
                message: "Staff not found or Invalid Credentials" 
            });
        }
        
        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid Credentials" 
            });
        }
        
        const payload = { id: staff._id, role: staff.role || "staff" };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        res.status(200).json({
            success: true,
            message: "Staff Login Successful",
            data: {
                accessToken,
                staff: { 
                    id: staff._id, 
                    name: staff.name, 
                    role: staff.role 
                }
            }
        });
    } catch (err) {
        console.error("Staff Login Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server Error during staff login." 
        });
    }
};
