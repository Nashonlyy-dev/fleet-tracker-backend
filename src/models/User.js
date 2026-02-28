import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6
    },
    role: {
        type: String,
        // Added 'admin' here so your System Admin works ⬇️
        enum: ['owner', 'driver', 'admin'],
        default: 'driver'
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId, // Fixed to .Types.ObjectId for safety
        ref: 'User',
        default: null // Explicitly null for Owners and Admins
    }
}, { 
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true 
});

// Index for faster performance when an Owner looks up their drivers
userSchema.index({ ownerId: 1 });

export default mongoose.model('User', userSchema);