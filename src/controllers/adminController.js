import User from "../models/User.js";

/**
 * @desc    Get all users for management
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users but exclude the password field for security
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * @desc    Update a user's role (e.g., promote Driver to Owner)
 * @route   PUT /api/v1/admin/update-role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        // Validation: Ensure role is valid
        const validRoles = ['driver', 'owner', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role type" });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { role }, 
            { new: true } // Returns the updated document
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: `User role updated to ${role} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};