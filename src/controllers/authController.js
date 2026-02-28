import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User with chosen role (defaults to driver if not provided)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'driver' 
        });

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password,  } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }
        const token = jsonwebtoken.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token , role: user.role , name: user.name});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}