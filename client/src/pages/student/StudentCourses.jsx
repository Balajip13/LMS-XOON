import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StudentCourseList from './StudentCourseList';

const StudentCourses = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-hover)' }}>
            {/* Minimal Top Bar */}
            <header style={{
                height: '70px',
                backgroundColor: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                        src="/logo.png"
                        alt="XOON"
                        style={{ height: '40px', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />
                </div>

                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="btn btn-primary"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </header>

            {/* Main Content Area */}
            <main className="container" style={{ padding: '3rem 1rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                        Browse Our Catalog
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
                        Invest in your future with our curated selection of industry-leading courses.
                    </p>
                </div>

                <StudentCourseList />
            </main>
        </div>
    );
};

export default StudentCourses;
