import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Chapter from '../models/Chapter.js';
import Lesson from '../models/Lesson.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const enrichmentData = [
    { title: 'Introduction & Foundations', lessons: ['Welcome & Course Overview', 'Setting Up Your Environment', 'Core Principles'] },
    { title: 'Fundamental Concepts', lessons: ['Deep Dive into Basics', 'Common Patterns & Workflows', 'Best Practices for Beginners'] },
    { title: 'Practical Implementation', lessons: ['Building Real-World Projects', 'Solving Common Challenges', 'Performance Optimization'] },
    { title: 'Advanced Techniques', lessons: ['Scaling Your Knowledge', 'Architecture & Design Patterns', 'Final Project & Summary'] }
];

const enrich = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for enrichment...');

        const courses = await Course.find();
        console.log(`Found ${courses.length} courses to enrich.`);

        for (const course of courses) {
            console.log(`- processing: ${course.title}`);

            // 1. Pricing Consistency Fix
            if (course.discountPercentage > 0) {
                // Ensure originalPrice is greater than price to show strike-through
                if (!course.originalPrice || course.originalPrice <= course.price) {
                    const markup = 1.2 + (Math.random() * 0.3); // 20-50% markup
                    course.originalPrice = Math.round((course.price / (1 - course.discountPercentage / 100)) * 1.1);
                    console.log(`  * Pricing updated: New Original Price ₹${course.originalPrice}`);
                }
            } else {
                // No discount, match them up to avoid ghostly strike-throughs
                course.originalPrice = course.price;
            }
            await course.save();

            // 2. Curriculum Enrichment
            const chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });

            // If the course has fewer than 4 chapters or very few lessons, enrich it
            const totalLessons = await Lesson.countDocuments({ chapter: { $in: chapters.map(c => c._id) } });

            if (chapters.length < 4 || totalLessons < 8) {
                console.log(`  * Enriching curriculum (Current: ${chapters.length} chapters, ${totalLessons} lessons)`);

                // Clear existing minimal curriculum if it feels "placeholder-y"
                if (chapters.length <= 1 && totalLessons <= 2) {
                    for (const ch of chapters) {
                        await Lesson.deleteMany({ chapter: ch._id });
                        await ch.deleteOne();
                    }

                    // Add full structure
                    for (let i = 0; i < enrichmentData.length; i++) {
                        const chapter = await Chapter.create({
                            course: course._id,
                            title: enrichmentData[i].title,
                            order: i + 1
                        });

                        for (let j = 0; j < enrichmentData[i].lessons.length; j++) {
                            await Lesson.create({
                                chapter: chapter._id,
                                title: enrichmentData[i].lessons[j],
                                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                duration: 300 + Math.floor(Math.random() * 600), // 5-15 mins
                                order: j + 1,
                                isFree: i === 0 && j === 0 // only first lesson free
                            });
                        }
                    }
                } else if (chapters.length < 4) {
                    // Just supplement missing chapters
                    const existingCount = chapters.length;
                    for (let i = existingCount; i < 4; i++) {
                        const chapter = await Chapter.create({
                            course: course._id,
                            title: enrichmentData[i].title,
                            order: i + 1
                        });

                        for (let j = 0; j < enrichmentData[i].lessons.length; j++) {
                            await Lesson.create({
                                chapter: chapter._id,
                                title: enrichmentData[i].lessons[j],
                                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                duration: 400 + Math.floor(Math.random() * 300),
                                order: j + 1,
                                isFree: false
                            });
                        }
                    }
                }
            }
        }

        console.log('Enrichment complete!');
        process.exit(0);
    } catch (error) {
        console.error('Enrichment failed:', error);
        process.exit(1);
    }
};

enrich();
