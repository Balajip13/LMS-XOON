import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavbarDashboard from './NavbarDashboard';
import '../Dashboard.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-wrapper">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="dashboard-main">
                <NavbarDashboard toggleSidebar={toggleSidebar} />

                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
