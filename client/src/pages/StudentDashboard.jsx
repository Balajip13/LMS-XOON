import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, token, refreshUser, api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changingPassword, setChangingPassword] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [enrollRes, paymentRes, certRes, announceRes] = await Promise.all([
                api.get('/courses/enrolled'),
                api.get('/payments/my-payments'),
                api.get('/certificates/my-certificates'),
                api.get('/announcements')
            ]);
            console.log("Enrollments API:", enrollRes.data);
            console.log("User ID:", user?._id);
            setCourses(enrollRes.data?.courses || []);
            setPayments(paymentRes.data);
            setCertificates(certRes.data);
            setAnnouncements(announceRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const updateProfile = async (data) => {
        try {
            await api.put('/users/profile', data);
            toast.success('Profile updated successfully');
            // Step 5: Safe Method - Refetch fresh user data from server
            await refreshUser();
            await fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            throw error;
        }
    };

    const updateNotificationSettings = async (data) => {
        try {
            await api.put('/users/notification-settings', data);
            toast.success('Notification settings updated');
            await refreshUser();
            await fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const uploadAvatar = async (formData) => {
        try {
            await api.post('/users/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Avatar updated successfully');
            // Step 5: Safe Method - Refetch fresh user data from server
            await refreshUser();
            await fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
            throw error;
        }
    };

    const updatePassword = async (data) => {
        setChangingPassword(true);
        try {
            await api.put('/users/change-password', data);
            toast.success('Password changed successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // This component now just provides data and context to its child routes via Outlet context
    return <Outlet context={{
        user,
        courses,
        payments,
        certificates,
        announcements,
        updateProfile,
        changingPassword,
        updatePassword,
        updateNotificationSettings,
        uploadAvatar
    }} />;
};

export default StudentDashboard;
