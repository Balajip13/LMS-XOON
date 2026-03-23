import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Lock, Camera, Bell, Shield, GraduationCap, ArrowRight, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const {
        user,
        updateProfile,
        changingPassword,
        updatePassword,
        updateNotificationSettings,
        uploadAvatar
    } = useOutletContext();
    const { api } = useAuth();
    const isSubmitting = useRef(false);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || '');
    const [uploading, setUploading] = useState(false);
    const [renderKey, setRenderKey] = useState(Date.now());

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user && !isSubmitting.current) {
            setName(user.name || '');
            setEmail(user.email || '');
            setBio(user.bio || '');
            setProfilePicPreview(user.profilePic || '');
        }
    }, [user]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview locally
        const previewUrl = URL.createObjectURL(file);
        setProfilePicPreview(previewUrl);

        setUploading(true);
        isSubmitting.current = true;
        try {
            const formData = new FormData();
            formData.append('image', file);
            const updatedUser = await uploadAvatar(formData);
            if (updatedUser) {
                setProfilePicPreview(updatedUser.profilePic);
                setRenderKey(Date.now());
            }
        } catch (error) {
            console.error('Avatar upload failed:', error);
            setProfilePicPreview(user?.profilePic || '');
        } finally {
            setUploading(false);
            isSubmitting.current = false;
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        isSubmitting.current = true;
        try {
            await updateProfile({ name, email, bio });
        } catch (error) {
            console.error('Profile update failed:', error);
        } finally {
            isSubmitting.current = false;
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match');
        }
        try {
            await updatePassword({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password update failed:', error);
        }
    };

    const [supportLoading, setSupportLoading] = useState(false);

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        const subject = e.target.subject.value;
        const message = e.target.message.value;
        if (!subject || !message) return toast.error('Please fill in all fields');

        setSupportLoading(true);
        try {
            await api.post('/support/tickets', { subject, message });
            toast.success('Support ticket submitted successfully');
            e.target.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit ticket');
        } finally {
            setSupportLoading(false);
        }
    };

    return (
        <div className="settings-container animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 1.25rem 2rem 1.25rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Settings</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Manage your profile, security, and account preferences.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {/* Left Column: Profile & Instructor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Profile Settings */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                                <User size={20} />
                            </div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Profile Information</h3>
                        </div>

                        <div className="profile-header-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div className="profile-image-container" style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px', maxWidth: '70px', maxHeight: '70px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', color: 'white', overflow: 'hidden' }}>
                                    {profilePicPreview ? (
                                        <img
                                            key={renderKey}
                                            src={profilePicPreview.startsWith('blob:') ? profilePicPreview : profilePicPreview}
                                            alt={user?.name}
                                            style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px', maxWidth: '70px', maxHeight: '70px', objectFit: 'cover', borderRadius: '50%', overflow: 'hidden', display: 'block', margin: 0, padding: 0 }}
                                            onError={(e) => {
                                                console.error('[SETTINGS] Image load error:', e.target.src);
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                    ) : (
                                        <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="profile-camera-btn"
                                    style={{
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
                                    {uploading ? (
                                        <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <Camera size={14} />
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={uploading}
                                />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</h2>
                                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Student</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Bio (Optional)</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', borderRadius: '8px', fontWeight: '600', marginTop: '0.5rem' }}>Save Changes</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Security & Notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Password Settings */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                                <Lock size={20} />
                            </div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Security</h3>
                        </div>

                        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-outline" disabled={changingPassword} style={{ padding: '0.75rem', borderRadius: '8px', fontWeight: '600', marginTop: '0.5rem' }}>
                                {changingPassword ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Other Settings */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                                <Bell size={20} />
                            </div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Notifications</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Email Notifications</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive updates about your courses.</p>
                                </div>
                                <div
                                    onClick={() => updateNotificationSettings({ email: !user?.notificationSettings?.email })}
                                    style={{
                                        width: '40px',
                                        height: '22px',
                                        backgroundColor: user?.notificationSettings?.email ? 'var(--primary)' : 'var(--border)',
                                        borderRadius: '100px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background-color 0.2s'
                                    }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: user?.notificationSettings?.email ? '20px' : '2px',
                                        top: '2px',
                                        width: '18px',
                                        height: '18px',
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        transition: 'left 0.2s'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Platform Notifications</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>See announcements in your dashboard.</p>
                                </div>
                                <div
                                    onClick={() => updateNotificationSettings({ platform: !user?.notificationSettings?.platform })}
                                    style={{
                                        width: '40px',
                                        height: '22px',
                                        backgroundColor: user?.notificationSettings?.platform ? 'var(--primary)' : 'var(--border)',
                                        borderRadius: '100px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background-color 0.2s'
                                    }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: user?.notificationSettings?.platform ? '20px' : '2px',
                                        top: '2px',
                                        width: '18px',
                                        height: '18px',
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        transition: 'left 0.2s'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help & Support Section */}
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Help & Support</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Need help? Submit a support ticket and we'll get back to you.</p>
                    </div>
                </div>

                <form onSubmit={handleSupportSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Subject</label>
                        <input
                            name="subject"
                            type="text"
                            placeholder="How can we help?"
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Message</label>
                        <textarea
                            name="message"
                            placeholder="Describe your issue in detail..."
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem', minHeight: '120px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={supportLoading} className="btn btn-primary" style={{ padding: '0.75rem 2.5rem', borderRadius: '8px', fontWeight: '600', opacity: supportLoading ? 0.7 : 1 }}>
                            {supportLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    h1 { font-size: 1.5rem !important; }
                    .settings-container { padding: 1rem !important; }
                    .profile-image-container {
                        width: 60px !important;
                        height: 60px !important;
                        font-size: 1.5rem !important;
                    }
                    .profile-camera-btn {
                        width: 24px !important;
                        height: 24px !important;
                        bottom: -4px !important;
                        right: -4px !important;
                    }
                    .profile-header-wrapper {
                        padding: 1rem !important;
                        gap: 0.75rem !important;
                    }
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Settings;
