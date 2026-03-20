import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import NavbarDashboard from './NavbarDashboard';
import '../Dashboard.css';
import '../instructor-dashboard.css';

const InstructorDashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-wrapper">
            <InstructorSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="dashboard-main">
                <NavbarDashboard toggleSidebar={toggleSidebar} />

                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboardLayout;
