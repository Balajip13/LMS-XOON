import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import fs from 'fs';

const debugCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const courses = await Course.find();
        let log = '--- ALL COURSES PRICING DATA ---\n';
        courses.forEach(c => {
            log += `Title: ${c.title}\n`;
            log += `- Price: ${c.price}\n`;
            log += `- OriginalPrice: ${c.originalPrice}\n`;
            log += `- Discount%: ${c.discountPercentage}\n`;
            log += `- Discount Amt: ${c.discount}\n`;
            log += `- hasDiscount (Logic): ${(c.originalPrice > c.price || c.discountPercentage > 0 || c.discount > 0)}\n`;
            log += '-----------------------------\n';
        });
        fs.writeFileSync('pricing_audit_clean.txt', log);
        console.log('Written to pricing_audit_clean.txt');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
debugCourses();
