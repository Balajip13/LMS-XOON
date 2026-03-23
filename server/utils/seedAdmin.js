import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
    try {
        const admin = await User.findOne({ email: "admin@xoon.com" });
        if (!admin) {
            const hashedPassword = await bcrypt.hash("admin@xoon321", 10);
            await User.create({
                name: "Admin",
                email: "admin@xoon.com",
                password: hashedPassword,
                role: "admin"
            });
            console.log("Default admin created successfully");
        } else {
            console.log("Admin already exists, skipping creation");
        }
    } catch (error) {
        console.error("Failed to seed admin:", error);
    }
};

export default createDefaultAdmin;
