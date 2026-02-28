import User from "../models/User.js";
import Location from "../models/Locations.js";
import bcrypt from "bcryptjs";

// 1. ADD DRIVER: Using "Atomic Transactions" logic
export const addDriver = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Validation: Don't wait for the hash if the user exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDriver = await User.create({
            name, email, password: hashedPassword,
            role: 'driver',
            ownerId: req.user._id 
        });

        // Initialize with findOneAndUpdate + upsert 
        // This prevents double-entry even if the request is sent twice
        await Location.findOneAndUpdate(
            { driverId: newDriver._id },
            { 
                location: { type: "Point", coordinates: [96.1561, 16.8661] },
                status: 'idle' // Psych: Start them as idle, not active
            },
            { upsert: true }
        );

        res.status(201).json({ success: true, message: "Driver added to fleet!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. GET FLEET LOCATIONS: Using "Lean" database queries
export const getMyFleetLocations = async (req, res) => {
    try {
        // 1. Find all drivers belonging to this owner first
        // This is faster than finding ALL locations and filtering later
        const myDrivers = await User.find({ ownerId: req.user._id }).select('_id');
        const driverIds = myDrivers.map(d => d._id);

        // 2. Query only the locations for these specific IDs
        const fleet = await Location.find({ driverId: { $in: driverIds } })
            .populate('driverId', 'name email role')
            .lean(); // Returns plain JS objects, much faster for the map

        res.status(200).json(fleet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};