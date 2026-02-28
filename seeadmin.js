import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js'; // Ensure correct path
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const adminEmail = "admin@trucktrack.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin already exists!");
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("SuperSecretAdmin123", salt);

        await User.create({
            name: "Main Administrator",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log("✅ Production Admin created successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();