import { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import contactImage from '../assets/contact-support.jpg';

const Contact = () => {
    const { api } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/contact', formData);
            if (response.data.success) {
                toast.success('Message sent successfully!');
                setFormData({ name: '', email: '', mobile: '', message: '' });
            } else {
                toast.error(response.data.message || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Contact Form Error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        We'd love to hear from you
                    </h1>
                </div>

                {/* Main Contact Section - Split Container */}
                <div className="contact-container" style={{
                    display: 'flex',
                    marginBottom: '3rem',
                    gap: '3rem'
                }}>
                    {/* Left Side: Image */}
                    <div className="contact-image-section" style={{
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2.5rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                    }}>
                        <img
                            src={contactImage}
                            alt="Contact Support"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', // Ensures full image is visible
                                objectPosition: 'center',
                                display: 'block'
                            }}
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="contact-form-section" style={{
                        flex: '1',
                        padding: '1rem 0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text)' }}>Send us a Message</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input
                                type="text"
                                required
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />

                            <input
                                type="email"
                                required
                                placeholder="Your Mail Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />

                            <input
                                type="tel"
                                required
                                placeholder="Your Mobile Number"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />

                            <textarea
                                rows="5"
                                required
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    fontSize: '0.95rem',
                                    resize: 'vertical',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            ></textarea>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '1rem',
                                    fontWeight: '600',
                                    marginTop: '0.5rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#172554', // Specific Dark Blue
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    width: '100%'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#1e3a8a';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#172554';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                                {!loading && <Send size={18} />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Contact Information Section (Grid) */}
                <div className="info-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', // 4 Columns on Desktop
                    gap: '1.5rem',
                    marginTop: '2rem'
                }}>
                    {/* 1. Office Address */}
                    <div className="info-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', height: '100%' }}>
                        <div style={{ color: 'var(--primary)', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '50%' }}><MapPin size={24} /></div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text)' }}>Office Address</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Xoon Infotech HQ, Tech Park,<br />Sector 62, Noida, India</p>
                        </div>
                    </div>

                    {/* 2. Email Address */}
                    <div className="info-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', height: '100%' }}>
                        <div style={{ color: 'var(--primary)', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '50%' }}><Mail size={24} /></div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text)' }}>Email Us</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@xoon.com</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>info@xoon.com</p>
                        </div>
                    </div>

                    {/* 3. Mobile Number */}
                    <div className="info-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', height: '100%' }}>
                        <div style={{ color: 'var(--primary)', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '50%' }}><Phone size={24} /></div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text)' }}>Call Us</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91 98765 43210</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91 120 456 7890</p>
                        </div>
                    </div>

                    {/* 4. Working Hours */}
                    <div className="info-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', height: '100%' }}>
                        <div style={{ color: 'var(--primary)', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '50%' }}><Clock size={24} /></div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text)' }}>Working Hours</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mon - Fri: 9am - 6pm</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sat: 10am - 2pm</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .info-grid {
                        grid-template-columns: repeat(2, 1fr) !important; /* 2 columns on tablet */
                    }
                }
                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr !important; /* 1 column on mobile */
                    }
                }
                @media (max-width: 968px) {
                    .contact-container {
                        flex-direction: column !important;
                        gap: 2rem !important;
                    }
                    .contact-image-section {
                        min-height: 250px;
                        height: 250px; /* Fixed height for mobile */
                        padding: 1.5rem !important;
                    }
                    .contact-image-section img {
                         border-radius: 0 !important;
                    }
                    .contact-form-section {
                        padding: 0 1rem !important;
                    }
                }
                
                input::placeholder, textarea::placeholder {
                    color: var(--text-secondary);
                    opacity: 0.7;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default Contact;
