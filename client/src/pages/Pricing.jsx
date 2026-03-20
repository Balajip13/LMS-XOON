import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, Crown } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            title: 'Basic',
            price: 'Free',
            icon: Zap,
            description: 'Perfect for getting started',
            features: [
                'Access to free courses',
                'Community support',
                'Mobile access',
                'Limited storage'
            ],
            cta: 'Get Started',
            popular: false
        },
        {
            title: 'Pro Learner',
            price: '₹499/mo',
            icon: Shield,
            description: 'For serious learners',
            features: [
                'Access to all courses',
                'Certificate of completion',
                'Priority support',
                'Download resources',
                'No ads'
            ],
            cta: 'Go Pro',
            popular: true
        },
        {
            title: 'Enterprise',
            price: 'Custom',
            icon: Crown,
            description: 'For teams and organizations',
            features: [
                'Unlimited users',
                'Custom learning paths',
                'Advanced analytics',
                'API access',
                'Dedicated account manager'
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <div style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text)' }}>
                    Simple, Transparent Pricing
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                    Choose the plan that's right for your learning journey.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                alignItems: 'stretch'
            }}>
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                            transform: plan.popular ? 'scale(1.05)' : 'none',
                            zIndex: plan.popular ? 10 : 1,
                            boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow)',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'var(--surface)'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '0.25rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                Most Popular
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: plan.popular ? '0.5rem' : '0' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '0.75rem',
                                borderRadius: '50%',
                                backgroundColor: plan.popular ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-hover)',
                                color: plan.popular ? 'var(--primary)' : 'var(--text-secondary)',
                                marginBottom: '1rem'
                            }}>
                                <plan.icon size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>{plan.title}</h3>
                            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>{plan.price}</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{plan.description}</p>
                        </div>

                        <ul style={{ flex: 1, listStyle: 'none', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {plan.features.map((feature, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <CheckCircle size={20} style={{ color: plan.popular ? 'var(--primary)' : 'var(--success)', flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            to={plan.title === 'Enterprise' ? '/contact' : '/register'}
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}
                        >
                            {plan.cta}
                        </Link>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '4rem',
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'var(--surface-hover)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Have questions?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Our support team is available 24/7 to help you with any queries.</p>
                <Link
                    to="/contact"
                    className="btn btn-primary"
                    style={{
                        padding: '0.875rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Contact Support
                </Link>
            </div>
        </div>
    );
};

export default Pricing;
