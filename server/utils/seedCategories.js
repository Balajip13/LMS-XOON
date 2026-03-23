import Category from '../models/Category.js';
import slugify from 'slugify';

const categories = [
    { name: "Web Development", description: "Learn to build modern websites and web applications." },
    { name: "Programming", description: "Master various programming languages and software development." },
    { name: "Data Science", description: "Analyze data and build machine learning models." },
    { name: "Marketing", description: "Digital marketing, SEO, and social media strategies." },
    { name: "DevOps", description: "Infrastructure management and automated deployment." },
    { name: "Cloud Computing", description: "Cloud platforms like AWS, Azure, and Google Cloud." },
    { name: "UI/UX", description: "Design beautiful and user-friendly interfaces." }
];

const seedCategories = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            const categoriesWithSlugs = categories.map(cat => ({
                ...cat,
                slug: slugify(cat.name, { lower: true })
            }));
            await Category.insertMany(categoriesWithSlugs);
            console.log("✅ Default categories seeded successfully");
        } else {
            console.log("ℹ️ Categories already exist, skipping seeding");
        }
    } catch (error) {
        console.error("❌ Failed to seed categories:", error);
    }
};

export default seedCategories;
