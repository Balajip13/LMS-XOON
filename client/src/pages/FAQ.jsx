import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "How do I enroll in a course?",
            answer: "Simply navigate to the Courses page, select the course you are interested in, and click the 'Buy Now' button. Follow the payment instructions to get instant access."
        },
        {
            question: "Is there a refund policy?",
            answer: "Yes, we offer a 30-day money-back guarantee on all our courses. If you are not satisfied, you can request a full refund."
        },
        {
            question: "Can I access the courses on mobile?",
            answer: "Absolutely! Our platform is fully responsive and works seamlessly on all mobile devices and tablets."
        },
        {
            question: "Do I get a certificate after completion?",
            answer: "Yes, upon successfully completing a course and all assignments, you will be awarded a verified certificate from Xoon Infotech."
        },
        {
            question: "Are the videos downloadable?",
            answer: "To ensure content security, videos are available for streaming only. However, supplementary resources like PDFs and code files are downloadable."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Frequently Asked Questions</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, index) => (
                    <div key={index} className="card" style={{ padding: 0 }}>
                        <button
                            onClick={() => toggleFAQ(index)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                backgroundColor: 'transparent',
                                color: 'var(--text)'
                            }}
                        >
                            {faq.question}
                            {activeIndex === index ? <Minus size={20} color="var(--primary)" /> : <Plus size={20} color="var(--text-secondary)" />}
                        </button>

                        {activeIndex === index && (
                            <div style={{
                                padding: '0 1.5rem 1.5rem 1.5rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
