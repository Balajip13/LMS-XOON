import { useNavigate, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CourseLayout = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
            {/* Professional Header Bar */}
            <header style={{
                height: '70px',
                backgroundColor: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: '1280px',
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <img
                        src="/logo.png"
                        alt="XOON"
                        style={{
                            height: '40px',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            filter: 'brightness(var(--logo-brightness))'
                        }}
                        onClick={() => navigate('/')}
                    />

                    {/* Back to Dashboard Button */}
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="btn btn-primary"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
};

export default CourseLayout;
