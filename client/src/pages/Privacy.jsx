const Privacy = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
            <h1 className="text-center mb-4" style={{ fontSize: '2.5rem' }}>Your Privacy Matters</h1>

            <div className="card" style={{ padding: '2.5rem', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    Hi there! At <strong>Xoon LMS</strong>, we believe trust is the foundation of learning. We want you to focus on your studies, not worry about your data. Here is a simple breakdown of how we handle your information.
                </p>

                <h3 className="mb-2" style={{ color: 'var(--primary)', marginTop: '2rem' }}>1. What we collect</h3>
                <p className="text-secondary">
                    We only collect what’s necessary to help you learn: your name (so we know what to put on your certificate!), your email (to send you course updates), and your progress tracking.
                </p>

                <h3 className="mb-2" style={{ color: 'var(--primary)', marginTop: '2rem' }}>2. How we use it</h3>
                <p className="text-secondary">
                    Your data is used strictly to improve your learning experience. We analyze which courses are popular to create better content. We <strong>never</strong> sell your personal data to advertisers.
                </p>

                <h3 className="mb-2" style={{ color: 'var(--primary)', marginTop: '2rem' }}>3. Your Payments</h3>
                <p className="text-secondary">
                    We use secure third-party payment gateways (like Razorpay). We never see or store your credit card or bank details. It’s handled directly by the bank's secure systems.
                </p>

                <h3 className="mb-2" style={{ color: 'var(--primary)', marginTop: '2rem' }}>4. Content Security</h3>
                <p className="text-secondary">
                    Our course materials are protected. We ask that you respect the hard work of our instructors and do not share your login details with others.
                </p>

                <h3 className="mb-2" style={{ color: 'var(--primary)', marginTop: '2rem' }}>5. Contact Us</h3>
                <p className="text-secondary">
                    If you have any questions or just want to say hi, drop us a message on our Contact page. We are real people and we'd love to help!
                </p>
            </div>
        </div>
    );
};

export default Privacy;
