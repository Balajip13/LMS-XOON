import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const enforceGlobalDiscounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const courses = await Course.find();
        console.log(`Applying Global Discount Standard to ${courses.length} courses...`);

        for (const course of courses) {
            // Rule: Every course must have a discount to match the JavaScript course look.
            // Requirement: originalPrice > finalPrice

            let changed = false;
            const currentPrice = Number(course.price) || 999;

            // If it has no discount or originalPrice isn't higher
            if (course.discountPercentage <= 0 && course.discount <= 0 && course.originalPrice <= course.price) {
                // Set default 25% discount to make it look attractive
                const targetPct = 25;
                course.discountPercentage = targetPct;

                // Calculate original price roughly
                let inferredOriginal = Math.round(currentPrice / (1 - targetPct / 100));

                // Marketing rounding (end in 99 or 49)
                if (inferredOriginal % 100 < 50) {
                    inferredOriginal = Math.floor(inferredOriginal / 100) * 100 + 49;
                } else {
                    inferredOriginal = Math.floor(inferredOriginal / 100) * 100 + 99;
                }

                course.originalPrice = inferredOriginal;
                changed = true;
                console.log(`- FIXED: ${course.title} (₹${course.price} <- ₹${course.originalPrice} | ${course.discountPercentage}%)`);
            } else if (course.originalPrice <= course.price && (course.discountPercentage > 0 || course.discount > 0)) {
                // Discount intended but originalPrice not set higher
                const targetPct = course.discountPercentage > 0 ? course.discountPercentage : 20;
                let inferredOriginal = Math.round(currentPrice / (1 - targetPct / 100));

                if (inferredOriginal % 100 < 50) {
                    inferredOriginal = Math.floor(inferredOriginal / 100) * 100 + 49;
                } else {
                    inferredOriginal = Math.floor(inferredOriginal / 100) * 100 + 99;
                }

                course.originalPrice = inferredOriginal;
                changed = true;
                console.log(`- SYNCED: ${course.title} (₹${course.price} <- ₹${course.originalPrice})`);
            }

            if (changed) {
                await course.save();
            }
        }

        console.log('Global Pricing Alignment Complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

enforceGlobalDiscounts();
