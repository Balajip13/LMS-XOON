import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.js';
import Course from './models/Course.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await Course.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...'.red.inverse);

        // Create Admin
        // Using simple create because pre-save hook handles hashing
        await User.create({
            name: 'Admin',
            email: 'admin@xoon.com',
            password: 'admin@xoon321',
            role: 'admin'
        });

        // Create Instructor
        await User.create({
            name: 'John Instructor',
            email: 'instructor@xoon.com',
            password: 'password123',
            role: 'instructor'
        });

        const courses = [
            {
                title: 'The Complete HTML5 & CSS3 Mastery',
                description: 'Build responsive websites with modern HTML5 and CSS3 techniques. Perfect for beginners.',
                instructor: 'Dr. Angela Yu',
                price: 499,
                category: 'Web Dev',
                thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/mU6anWqZJcc', // Freecodecamp HTML
                rating: 4.8,
                numReviews: 1024,
                isPublished: true,
                videos: [{ title: 'Intro to HTML', duration: '10:00', isFree: true }]
            },
            {
                title: 'JavaScript: The Hard Parts',
                description: 'Deep dive into closure, callbacks, promises, and async JavaScript.',
                instructor: 'Will Sentance',
                price: 900,
                originalPrice: 1000,
                discountPercentage: 10,
                category: 'Web Dev',
                thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/DHjqpvDnNGE', // JavaScript in 100 Seconds - 2:23 duration
                rating: 4.9,
                numReviews: 2100,
                isPublished: true,
                videos: [{ title: 'Execution Context', duration: '15:20', isFree: true }]
            },
            {
                title: 'Python for Data Science and Machine Learning',
                description: 'Master Python for data analysis, visualization, and machine learning.',
                instructor: 'Jose Portilla',
                price: 1299,
                category: 'Data Science',
                thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/LHBE6Q9XlzI',
                rating: 4.7,
                numReviews: 5000,
                isPublished: true,
                videos: [{ title: 'NumPy Basics', duration: '12:00', isFree: true }]
            },
            {
                title: 'React - The Complete Guide (incl Hooks, React Router)',
                description: 'Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!',
                instructor: 'Maximilian Schwarzmüller',
                price: 1499,
                category: 'Web Dev',
                thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
                rating: 4.9,
                numReviews: 3200,
                isPublished: true,
                videos: [{ title: 'React Basics', duration: '20:00', isFree: true }]
            },
            {
                title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
                description: 'Master Node by building a real-world RESTful API and web app.',
                instructor: 'Jonas Schmedtmann',
                price: 999,
                category: 'Web Dev',
                thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
                rating: 4.8,
                numReviews: 1500,
                isPublished: true,
                videos: [{ title: 'Event Loop', duration: '18:00', isFree: true }]
            },
            {
                title: 'AWS Certified Solutions Architect - Associate',
                description: 'Ultimate AWS Certified Solutions Architect Associate study guide.',
                instructor: 'Stephane Maarek',
                price: 1999,
                category: 'Cloud Computing',
                thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/Ia-UEZhR-aI',
                rating: 4.9,
                numReviews: 8000,
                isPublished: true,
                videos: [{ title: 'IAM Roles', duration: '10:00', isFree: true }]
            },
            {
                title: 'Docker and Kubernetes: The Complete Guide',
                description: 'Build, test, and deploy Docker applications with Kubernetes.',
                instructor: 'Stephen Grider',
                price: 1499,
                category: 'DevOps',
                thumbnailUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/fqMOX6JJhGo',
                rating: 4.8,
                numReviews: 4000,
                isPublished: true,
                videos: [{ title: 'Docker Containers', duration: '15:00', isFree: true }]
            },
            {
                title: 'Complete UI/UX Design Masterclass',
                description: 'Learn App Design and Web Design with Figma.',
                instructor: 'Gary Simon',
                price: 899,
                category: 'UI/UX',
                thumbnailUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d4f?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
                rating: 4.7,
                numReviews: 1200,
                isPublished: true,
                videos: [{ title: 'Figma Basics', duration: '25:00', isFree: true }]
            },
            {
                title: 'Git & GitHub Bootcamp',
                description: 'Master Git and GitHub and collaborate with other developers.',
                instructor: 'Brad Traversy',
                price: 499,
                category: 'DevOps',
                thumbnailUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/SWYqp7iY_Tc',
                rating: 4.9,
                numReviews: 900,
                isPublished: true,
                videos: [{ title: 'Git Branching', duration: '12:00', isFree: true }]
            },
            {
                title: 'Java Programming Masterclass',
                description: 'Learn Java In This Course And Become a Computer Programmer.',
                instructor: 'Tim Buchalka',
                price: 1199,
                category: 'Programming',
                thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800',
                videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34',
                rating: 4.6,
                numReviews: 6000,
                isPublished: true,
                videos: [{ title: 'Hello World', duration: '08:00', isFree: true }]
            }
        ];

        await Course.insertMany(courses);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

seedData();
