import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPricingData } from '../utils/pricing';
import CheckoutHeader from '../components/CheckoutHeader';

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, api } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [razorpayConfig, setRazorpayConfig] = useState({ keyId: '', enabled: false });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setCourse(data);

                // Fetch Public Config (using credentials to access secure endpoint)
                const configRes = await api.get('/payments/razorpay-config');
                setRazorpayConfig(configRes.data);

            } catch (error) {
                toast.error('Failed to load course details');
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setProcessing(true);
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setProcessing(false);
            return;
        }

        try {
            const { data: order } = await api.post('/payments/order',
                { courseId: id }
            );

            const options = {
                key: razorpayConfig.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'XOON LMS',
                description: `Purchase ${course.title}`,
                image: '/logo.png',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: id
                        });

                        if (verifyRes.data.message === 'Payment success') {
                            toast.success('Enrollment Successful!');
                            navigate('/student/dashboard');
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: 'User Name',
                    email: 'user@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#1e3a8a'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setProcessing(false);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Order creation failed');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <>
                <CheckoutHeader />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    color: 'var(--text-secondary)',
                    fontSize: '1rem'
                }}>
                    Loading...
                </div>
            </>
        );
    }

    if (!course) {
        return (
            <>
                <CheckoutHeader />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    color: 'var(--error)',
                    fontSize: '1rem'
                }}>
                    Course not found
                </div>
            </>
        );
    }

    const pricing = getPricingData(course);

    return (
        <>
            <CheckoutHeader />
            <div style={{
                minHeight: '100vh',
                backgroundColor: 'var(--background)',
                paddingTop: '3rem',
                paddingBottom: '4rem'
            }}>
                {/* Main Container */}
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 1.5rem'
                }}>
                    {/* Title Section */}
                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'var(--text)',
                            marginBottom: '0.5rem'
                        }}>
                            Secure Checkout
                        </h1>
                        <p style={{
                            fontSize: '0.9375rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem'
                        }}>
                            Review your order and complete your purchase
                        </p>
                        <div style={{
                            height: '1px',
                            backgroundColor: 'var(--border)',
                            maxWidth: '200px',
                            margin: '0 auto'
                        }}></div>
                    </div>

                    {/* Two Column Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2rem',
                    }} className="checkout-grid">

                        {/* LEFT: Course Summary Card */}
                        <div style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '14px',
                            padding: '2rem',
                            boxShadow: 'var(--shadow)',
                            border: '1px solid var(--border)'
                        }}>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: 'var(--text)',
                                marginBottom: '1.5rem'
                            }}>
                                Course Summary
                            </h2>

                            {/* Thumbnail */}
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    marginBottom: '1.25rem'
                                }}
                            />

                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                color: 'var(--text)',
                                marginBottom: '0.75rem',
                                lineHeight: '1.4'
                            }}>
                                {course.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                marginBottom: '1rem'
                            }}>
                                {course.description?.substring(0, 120)}...
                            </p>

                            {/* Instructor */}
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1.5rem',
                                paddingBottom: '1.5rem',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <span style={{ fontWeight: '500' }}>Instructor:</span>{' '}
                                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                    {course.instructor?.name || 'Expert Instructor'}
                                </span>
                            </div>

                            {/* What You'll Get Section */}
                            <div style={{
                                backgroundColor: 'var(--surface-hover)',
                                borderRadius: '10px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: '600',
                                    color: 'var(--text)',
                                    marginBottom: '1rem'
                                }}>
                                    What You'll Get
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <CheckCircle size={16} color="var(--success)" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Lifetime access to course</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <CheckCircle size={16} color="var(--success)" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Downloadable resources</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <CheckCircle size={16} color="var(--success)" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Certificate of completion</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <CheckCircle size={16} color="var(--success)" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Access on mobile and desktop</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <CheckCircle size={16} color="var(--success)" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Instructor Q&A support</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div>
                                {pricing.hasDiscount && (
                                    <div style={{
                                        fontSize: '1rem',
                                        color: 'var(--text-muted)',
                                        textDecoration: 'line-through',
                                        marginBottom: '0.375rem'
                                    }}>
                                        {pricing.displayOriginalPrice}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: 'var(--primary)'
                                }}>
                                    {pricing.displayPrice}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Payment Summary Card */}
                        <div style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '14px',
                            padding: '2rem',
                            boxShadow: 'var(--shadow)',
                            border: '1px solid var(--border)',
                            height: 'fit-content'
                        }}>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: 'var(--text)',
                                marginBottom: '1.5rem'
                            }}>
                                Order Summary
                            </h2>

                            {/* Price Breakdown */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.75rem',
                                    fontSize: '0.9375rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span>Original Price</span>
                                    <span style={{ fontWeight: '500' }}>{pricing.displayOriginalPrice}</span>
                                </div>

                                {pricing.hasDiscount && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.9375rem',
                                        color: 'var(--success)',
                                        fontWeight: '600'
                                    }}>
                                        <span>Discount</span>
                                        <span>-₹{(pricing.originalPrice - pricing.finalPrice).toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div style={{
                                    height: '1px',
                                    backgroundColor: 'var(--border)',
                                    margin: '1.25rem 0'
                                }}></div>

                                {/* Total */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'var(--text)'
                                    }}>
                                        Total
                                    </span>
                                    <span style={{
                                        fontSize: '2rem',
                                        fontWeight: '700',
                                        color: 'var(--text)'
                                    }}>
                                        {pricing.displayPrice}
                                    </span>
                                </div>

                                {/* Tax Info */}
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    textAlign: 'right'
                                }}>
                                    Inclusive of all taxes
                                </div>
                            </div>

                            {/* Security Divider */}
                            <div style={{
                                height: '1px',
                                backgroundColor: 'var(--border)',
                                margin: '1.5rem 0'
                            }}></div>

                            {/* Security Badges */}
                            <div style={{
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: 'var(--surface-hover)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Shield size={18} color="var(--primary)" />
                                    </div>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Razorpay Secure Checkout
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: 'var(--surface-hover)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Lock size={16} color="var(--text-secondary)" />
                                    </div>
                                    <span style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        256-bit SSL encryption
                                    </span>
                                </div>
                            </div>

                            {/* Payment Button */}
                            {(!razorpayConfig.enabled || !razorpayConfig.keyId) ? (
                                <div style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--surface-hover)',
                                    color: 'var(--text-muted)',
                                    textAlign: 'center',
                                    marginBottom: '1rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    Payments are currently offline
                                </div>
                            ) : (
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        borderRadius: '10px',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        marginBottom: '1rem',
                                        opacity: processing ? 0.6 : 1
                                    }}
                                >
                                    {processing ? 'Processing...' : 'Complete Secure Payment'}
                                </button>
                            )}

                            {/* Security Reassurance */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                                    <Lock size={12} />
                                    <span>Secure payments powered by Razorpay</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                                    <Shield size={12} />
                                    <span>256-bit SSL encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Help */}
                    <div style={{
                        marginTop: '3rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)'
                        }}>
                            Need help?
                        </span>
                        <Link
                            to={user?.role === 'student' ? '/student/support' : '/contact'}
                            className="btn btn-outline"
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile-specific CSS */}
            <style>{`
                @media (max-width: 768px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Payment;
