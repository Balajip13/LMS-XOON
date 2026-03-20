import mongoose from 'mongoose';
import Category from './models/Category.js';
import dotenv from 'dotenv';
import slugify from 'slugify';

dotenv.config();

const categories = [
    { name: 'Development', description: 'Software engineering, web development, mobile apps' },
    { name: 'Business', description: 'Finance, management, entrepreneurship' },
    { name: 'IT & Software', description: 'Network & security, hardware, operating systems' },
    { name: 'Design', description: 'Graphic design, UI/UX, 3D & animation' },
    { name: 'Marketing', description: 'Digital marketing, SEO, social media' },
    { name: 'Personal Development', description: 'Productivity, leadership, soft skills' }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Category.deleteMany();

        const seededCategories = categories.map(cat => ({
            ...cat,
            slug: slugify(cat.name, { lower: true })
        }));

        await Category.insertMany(seededCategories);
        console.log('Categories seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seed();
