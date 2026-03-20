import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    Clock,
    Building,
    MessageSquare,
    Send,
    MapPin
} from 'lucide-react';

const Support = () => {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "How do I enroll in a course?",
            a: "Browse our catalog on the 'Courses' page, select a course you're interested in, and click the 'Enroll Now' button. If it's a paid course, you'll be redirected to our secure payment gateway."
        },
        {
            q: "How do I download certificates?",
            a: "Once you complete 100% of the lessons in a course, your certificate will be automatically generated. You can find and download all your earned certificates in the 'Certificates' tab."
        },
        {
            q: "How do I contact support?",
            a: "You can use the contact form on the right to send us a direct message, or reach out via the email and phone number listed in our contact information section below."
        },
        {
            q: "How do I track my progress?",
            a: "Your 'Dashboard' and 'Reports' tabs provide a comprehensive view of your learning progress, including completion percentages, time spent learning, and quiz results."
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !message) {
            return toast.error('Please fill in all fields');
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Your message has been sent. We will get back to you soon!');
            setSubject('');
            setMessage('');
            setIsSubmitting(false);
        }, 1000);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2rem' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Help & Support</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Get answers to common questions or reach out to our support team.
                </p>
            </div>

            {/* Main Content: 2-Column Layout */}
            <div className="support-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2.5rem',
                alignItems: 'start'
            }}>
                {/* LEFT SIDE: FAQ Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                            <HelpCircle size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Frequently Asked Questions</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    style={{
                                        width: '100%',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)' }}>{faq.q}</span>
                                    {openFaq === index ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                                </button>
                                {openFaq === index && (
                                    <div style={{
                                        padding: '0 1.25rem 1.25rem 1.25rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.5',
                                        fontSize: '0.9rem',
                                        animation: 'slideDown 0.2s ease-out'
                                    }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: Support Form */}
                <div style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                            <MessageSquare size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Send us a message</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="How can we help?"
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'border-color 0.2s'
                                }}
                                className="support-input"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Provide more details about your inquiry..."
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    minHeight: '140px',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    resize: 'vertical',
                                    transition: 'border-color 0.2s'
                                }}
                                className="support-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem'
                            }}
                        >
                            {isSubmitting ? 'Sending...' : (
                                <>
                                    Send Message
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* BOTTOM SECTION: Contact Information (Horizontal Layout) */}
            <div className="contact-info-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginTop: '1rem'
            }}>
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <Mail size={18} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Support</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>support@xoonlms.com</p>
                    </div>
                </div>

                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <Phone size={18} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Phone Support</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>+1 (555) 123-4567</p>
                    </div>
                </div>

                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <Clock size={18} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Office Hours</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>Mon - Fri, 9AM - 6PM</p>
                    </div>
                </div>

                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Office Address</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>123 Innovation Way, NY</p>
                    </div>
                </div>
            </div>

            <style>{`
                .support-input:focus {
                    border-color: var(--primary) !important;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 900px) {
                    .support-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Support;
