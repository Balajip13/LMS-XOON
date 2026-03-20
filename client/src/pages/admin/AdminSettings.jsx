import { useState, useEffect } from 'react';
import { Save, Lock, Globe, Mail, Percent, CreditCard, Shield, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AdminSettings.css';

const AdminSettings = () => {
    const { api } = useAuth();
    const [settings, setSettings] = useState({
        platformName: '',
        commissionPercentage: 0,
        paymentCommissionPercentage: 0,
        maintenanceMode: false,
        defaultCurrency: 'INR',
        smtpConfig: {
            host: '',
            port: 587,
            user: '',
            pass: '',
            secure: false
        },
        razorpayConfig: {
            keyId: '',
            enabled: false
        }
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const { data } = await api.get('/admin/settings');
            setSettings(data);
            if (isManual) toast.success('Settings synchronized');
        } catch (err) {
            console.error('Fetch settings error:', err);
            toast.error('Failed to load system settings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault ? e.preventDefault() : null;
        setIsSaving(true);
        try {
            const { data } = await api.put('/admin/settings', settings);
            setSettings(data);
            toast.success('Settings updated successfully');
        } catch (err) {
            console.error('Save settings error:', err);
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        setIsSavingPassword(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (loading && !refreshing) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <div className="admin-settings-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <header className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Platform Settings</h1>
                        <p className="admin-page-subtitle">Configure global behavior and financial parameters</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn btn-outline btn-compact"
                            onClick={() => fetchSettings(true)}
                            disabled={refreshing || isSaving}
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            <span className="btn-text">Sync</span>
                        </button>
                        <button
                            className="btn btn-primary btn-compact"
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            <span className="btn-text">Save Changes</span>
                        </button>
                    </div>
                </header>

                <div className="admin-settings-grid-layout">
                    {/* Row 1: Left - Financial Settings */}
                    <div className="settings-section-card">
                        <div className="section-header">
                            <div className="section-icon financial">
                                <CreditCard size={18} />
                            </div>
                            <h3>Financial Settings</h3>
                        </div>
                        <div className="section-body">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Default Currency</label>
                                    <select
                                        value={settings.defaultCurrency}
                                        onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                                        disabled={isSaving}
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Gateway Fee (%)</label>
                                    <div className="input-with-icon">
                                        <Percent size={16} className="input-icon" />
                                        <input
                                            type="number"
                                            value={settings.paymentCommissionPercentage}
                                            onChange={(e) => setSettings({ ...settings, paymentCommissionPercentage: Number(e.target.value) })}
                                            placeholder="Enter gateway fee"
                                            disabled={isSaving}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 1: Right - General Configuration */}
                    <div className="settings-section-card">
                        <div className="section-header">
                            <div className="section-icon general">
                                <Globe size={18} />
                            </div>
                            <h3>General Configuration</h3>
                        </div>
                        <div className="section-body">
                            <div className="admin-form-group">
                                <label>Platform Name</label>
                                <input
                                    type="text"
                                    value={settings.platformName}
                                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                    placeholder="Enter platform name"
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Instructor Commission (%)</label>
                                <div className="input-with-icon">
                                    <Percent size={16} className="input-icon" />
                                    <input
                                        type="number"
                                        value={settings.commissionPercentage}
                                        onChange={(e) => setSettings({ ...settings, commissionPercentage: Number(e.target.value) })}
                                        placeholder="Enter instructor commission"
                                        disabled={isSaving}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className="maintenance-toggle-compact">
                                <div className="toggle-label">
                                    <h4>Maintenance Mode</h4>
                                    <p>Restrict public access</p>
                                </div>
                                <label className="modern-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                        disabled={isSaving}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Left - SMTP Configuration */}
                    <div className="settings-section-card">
                        <div className="section-header">
                            <div className="section-icon smtp">
                                <Mail size={18} />
                            </div>
                            <h3>SMTP Configuration</h3>
                        </div>
                        <div className="section-body">
                            {/* SMTP Host Full Width */}
                            <div className="admin-form-group">
                                <label>SMTP Host</label>
                                <input
                                    type="text"
                                    value={settings.smtpConfig?.host}
                                    onChange={(e) => setSettings({ ...settings, smtpConfig: { ...settings.smtpConfig, host: e.target.value } })}
                                    placeholder="Enter SMTP host (example: smtp.gmail.com)"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Username & Password Row */}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>SMTP Username</label>
                                    <input
                                        type="text"
                                        value={settings.smtpConfig?.user || ''}
                                        onChange={(e) => setSettings({ ...settings, smtpConfig: { ...settings.smtpConfig, user: e.target.value } })}
                                        placeholder="Enter SMTP username"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>SMTP Password</label>
                                    <input
                                        type="password"
                                        value={settings.smtpConfig?.pass || ''}
                                        onChange={(e) => setSettings({ ...settings, smtpConfig: { ...settings.smtpConfig, pass: e.target.value } })}
                                        placeholder="Enter SMTP password"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Port & SSL Row */}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Port</label>
                                    <input
                                        type="number"
                                        value={settings.smtpConfig?.port !== undefined ? settings.smtpConfig.port : ''}
                                        onChange={(e) => setSettings({ ...settings, smtpConfig: { ...settings.smtpConfig, port: Number(e.target.value) } })}
                                        placeholder="Enter port (example: 587)"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="admin-form-group checkbox-cell">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={settings.smtpConfig?.secure}
                                            onChange={(e) => setSettings({ ...settings, smtpConfig: { ...settings.smtpConfig, secure: e.target.checked } })}
                                            disabled={isSaving}
                                        />
                                        <span className="label-text">Secure SSL/TLS</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Right - Razorpay Configuration */}
                    <div className="settings-section-card">
                        <div className="section-header">
                            <div className="section-icon financial">
                                <CreditCard size={18} />
                            </div>
                            <h3>Razorpay Configuration</h3>
                        </div>
                        <div className="section-body">
                            <div className="admin-form-group">
                                <label>Razorpay Key ID</label>
                                <input
                                    type="text"
                                    value={settings.razorpayConfig?.keyId || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        razorpayConfig: { ...settings.razorpayConfig, keyId: e.target.value }
                                    })}
                                    placeholder="Enter Razorpay Key ID"
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="maintenance-toggle-compact">
                                <div className="toggle-label">
                                    <h4>Enable Razorpay</h4>
                                    <p>Allow student checkouts via Razorpay</p>
                                </div>
                                <label className="modern-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.razorpayConfig?.enabled || false}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            razorpayConfig: { ...settings.razorpayConfig, enabled: e.target.checked }
                                        })}
                                        disabled={isSaving}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Security & Password (Full Width) */}
                    <div className="settings-section-card settings-full-column">
                        <div className="section-header">
                            <div className="section-icon security">
                                <Shield size={18} />
                            </div>
                            <h3>Security & Password</h3>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="section-body security-body">
                                <div className="security-form-row">
                                    <div className="admin-form-group">
                                        <label>Current Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                disabled={isSavingPassword}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>New Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                disabled={isSavingPassword}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Confirm Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                disabled={isSavingPassword}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="security-action">
                                    <button type="submit" className="btn btn-primary" disabled={isSavingPassword}>
                                        {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        <span style={{ marginLeft: '8px' }}>Update Password</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
