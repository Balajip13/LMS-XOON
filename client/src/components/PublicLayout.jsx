import { Outlet } from 'react-router-dom';
import NavbarPublic from './NavbarPublic';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
    return (
        <>
            <NavbarPublic />
            <main className="main-content">
                {children || <Outlet />}
            </main>
            <Footer />
        </>
    );
};

export default PublicLayout;
