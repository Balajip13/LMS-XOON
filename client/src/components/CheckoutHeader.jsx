import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CheckoutHeader = () => {
    return (
        <header style={{
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            padding: '1.25rem 0'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '900px',
                margin: '0 auto',
                padding: '0 1.5rem'
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none'
                }}>
                    <img
                        src="/logo.png"
                        alt="XOON"
                        style={{
                            height: '40px',
                            objectFit: 'contain',
                            filter: 'brightness(var(--logo-brightness))'
                        }}
                    />
                </Link>

                {/* Back to Dashboard */}
                <Link
                    to="/student/dashboard"
                    className="btn btn-primary"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>
        </header>
    );
};

export default CheckoutHeader;
