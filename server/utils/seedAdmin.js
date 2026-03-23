import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
    try {
        const adminEmail = "admin@xoon.com";
        const adminPassword = "admin@xoon321";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            await User.create({
                name: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });
            console.log("✅ Default admin created successfully");
        } else {
            // Task 4 & 5: Handle existing admin (Update role and password)
            let updated = false;
            
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                updated = true;
            }

            // Always reset password to the default for this fix to be sure
            admin.password = hashedPassword;
            updated = true;

            if (updated) {
                await admin.save();
                console.log("✅ Admin account synchronized (Role: 'admin', Password: [PROTECTED])");
            } else {
                console.log("ℹ️ Admin already synced, skipping update");
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed admin:", error);
    }
};

export default createDefaultAdmin;
