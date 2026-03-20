import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, FileText, Loader2, Save, Camera, Lock, Bell, ChevronRight, UserCircle, BookOpen, Megaphone, HeadphonesIcon, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorSettings = () => {
    const { user, api, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        mobile: user?.mobile || '',
        profileImage: user?.profileImage || ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');
    const isSubmitting = useRef(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notifications State
    const [notifications, setNotifications] = useState({
        email: user?.notificationSettings?.email ?? true,
        courseUpdates: user?.notificationSettings?.courseUpdates ?? true,
        platform: user?.notificationSettings?.platform ?? true
    });

    // Support Form State
    const [supportForm, setSupportForm] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [supportLoading, setSupportLoading] = useState(false);

    useEffect(() => {
        if (user && !isSubmitting.current) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                mobile: user.mobile || '',
                profileImage: user.profileImage || ''
            });
            setAvatarPreview(user.profileImage || '');
            setNotifications({
                email: user.notificationSettings?.email ?? true,
                courseUpdates: user.notificationSettings?.courseUpdates ?? true,
                platform: user.notificationSettings?.platform ?? true
            });
        }
    }, [user]);

    const [renderKey, setRenderKey] = useState(Date.now());

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            isSubmitting.current = true;
            let currentUpdatedData = { ...profileData };

            // 1. Update Profile Image if changed
            if (avatarFile) {
                const formData = new FormData();
                formData.append('image', avatarFile);
                const avatarRes = await api.post('/users/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (avatarRes.data) {
                    const newImageUrl = avatarRes.data.profileImage;
                    currentUpdatedData.profileImage = newImageUrl;

                    // Update global state immediately (Safe Method: Refetch fresh from server)
                    await refreshUser();

                    // Update local states
                    setProfileData(prev => ({ ...prev, profileImage: newImageUrl }));
                    setAvatarPreview(newImageUrl);
                    setRenderKey(Date.now());
                }
            }

            // 2. Update Profile Data
            const res = await api.put('/users/profile', currentUpdatedData);
            if (res.data) {
                toast.success('Profile updated successfully');
                // Step 5: Safe Method - Refetch fresh user data from server
                await refreshUser();
                setRenderKey(Date.now());
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
            setAvatarFile(null);
            isSubmitting.current = false;
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        try {
            setLoading(true);
            const res = await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data) {
                toast.success('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = async (type) => {
        try {
            const updated = { ...notifications, [type]: !notifications[type] };
            setNotifications(updated);
            await api.put('/users/notification-settings', updated);
        } catch (error) {
            toast.error('Failed to update notification settings');
            setNotifications(notifications); // Rollback
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: UserCircle },
        { id: 'account', label: 'Account', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'support', label: 'Help & Support', icon: FileText }
    ];

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">Settings</h1>
                    <p className="instructor-page-subtitle">Customize your instructor profile and account preferences.</p>
                </div>
            </div>

            <div className="settings-layout">
                {/* Sidebar Tabs */}
                <div className="settings-sidebar-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="settings-content-area">
                    {activeTab === 'profile' && (
                        <div className="animate-in">
                            <form onSubmit={handleProfileSubmit} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                                {/* Profile Avatar Card */}
                                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '700', color: 'white', overflow: 'hidden' }}>
                                            {avatarPreview ? (
                                                <img
                                                    key={renderKey}
                                                    src={avatarPreview.startsWith('blob:') ? avatarPreview : `${avatarPreview.split('?')[0]}${avatarPreview.includes('?') ? '&' : '?'}t=${new Date(user.updatedAt || Date.now()).getTime()}`}
                                                    alt="Avatar"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block', margin: 0, padding: 0 }}
                                                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                                />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase() || 'I'
                                            )}
                                        </div>
                                        <label htmlFor="avatar-upload" style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '3px solid var(--surface)',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            <Camera size={14} />
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profileData.name}</h2>
                                        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Teaching since {new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Professional Bio</label>
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            placeholder="Tell your students about your expertise..."
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem', minHeight: '120px', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Phone size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={profileData.mobile}
                                                onChange={handleProfileChange}
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                                placeholder="Enter your mobile number"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="animate-in">
                            <form onSubmit={handlePasswordSubmit} className="card p-6 flex-column gap-6">
                                <h3 className="card-header-title text-xl font-bold mb-4">Change Password</h3>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="form-control"
                                        placeholder="••••••••"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            className="form-control"
                                            placeholder="••••••••"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control"
                                            placeholder="••••••••"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex-end">
                                    <button type="submit" disabled={loading} className="btn btn-primary btn-lg min-w-[200px]">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Update Password</>}
                                    </button>
                                </div>
                            </form>

                            <div className="card danger-zone-card p-6">
                                <h3 className="danger-title text-lg font-bold">Danger Zone</h3>
                                <p className="text-muted text-sm m-0">
                                    Permanently delete your instructor account and all your course data. This action is irreversible.
                                </p>
                                <button type="button" className="btn btn-outline-danger">Delete This Account</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section-wrapper animate-in">
                            <div className="notif-cards-stack">
                                {/* Email Alerts */}
                                <div className="notif-row-card">
                                    <div className="notif-row-left">
                                        <div className="notif-icon-box blue">
                                            <Mail size={20} />
                                        </div>
                                        <div className="notif-text">
                                            <p className="notif-title">Email Alerts</p>
                                            <p className="notif-desc">Receive email updates about course activity</p>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationToggle('email')} />
                                        <span className="toggle-track"><span className="toggle-thumb"></span></span>
                                    </label>
                                </div>

                                {/* Course Updates */}
                                <div className="notif-row-card">
                                    <div className="notif-row-left">
                                        <div className="notif-icon-box emerald">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="notif-text">
                                            <p className="notif-title">Course Updates</p>
                                            <p className="notif-desc">Notifications when students enroll or submit assignments</p>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={notifications.courseUpdates} onChange={() => handleNotificationToggle('courseUpdates')} />
                                        <span className="toggle-track"><span className="toggle-thumb"></span></span>
                                    </label>
                                </div>

                                {/* Platform Announcements */}
                                <div className="notif-row-card">
                                    <div className="notif-row-left">
                                        <div className="notif-icon-box amber">
                                            <Megaphone size={20} />
                                        </div>
                                        <div className="notif-text">
                                            <p className="notif-title">Platform Announcements</p>
                                            <p className="notif-desc">Updates about system announcements and maintenance</p>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={notifications.platform} onChange={() => handleNotificationToggle('platform')} />
                                        <span className="toggle-track"><span className="toggle-thumb"></span></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="settings-section-wrapper animate-in">
                            <div className="support-form-card">
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const subject = e.target.subject.value;
                                        const message = e.target.message.value;
                                        if (!subject || !message) return toast.error('Please fill in all fields');
                                        try {
                                            setSupportLoading(true);
                                            await api.post('/support/tickets', { subject, message });
                                            toast.success('Support request submitted successfully!');
                                            e.target.reset();
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || 'Failed to submit request');
                                        } finally {
                                            setSupportLoading(false);
                                        }
                                    }}
                                    className="support-form"
                                >
                                    <div className="support-form-group">
                                        <label className="support-label">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="support-input"
                                            placeholder="Brief summary of your issue..."
                                            required
                                        />
                                    </div>

                                    <div className="support-form-group">
                                        <label className="support-label">Description</label>
                                        <textarea
                                            name="message"
                                            className="support-textarea"
                                            placeholder="Describe your issue in detail..."
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <div className="support-form-actions" style={{ justifyContent: 'center' }}>
                                        <button type="submit" disabled={supportLoading} className="btn btn-primary support-submit-btn" style={{ width: '100%' }}>
                                            {supportLoading
                                                ? <><Loader2 className="animate-spin" size={18} /> Submitting...</>
                                                : 'Submit'
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorSettings;
