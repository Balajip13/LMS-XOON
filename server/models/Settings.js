import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema({
    platformName: {
        type: String,
        default: 'XOON LMS'
    },
    commissionPercentage: {
        type: Number,
        default: 10, // Platform takes 10%
        min: 0,
        max: 100
    },
    paymentCommissionPercentage: {
        type: Number,
        default: 2, // Payment gateway fee
        min: 0,
        max: 100
    },
    smtpConfig: {
        host: String,
        port: Number,
        user: String,
        pass: String,
        secure: { type: Boolean, default: false }
    },
    razorpayConfig: {
        keyId: { type: String, default: '' },
        enabled: { type: Boolean, default: false }
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    defaultCurrency: {
        type: String,
        default: 'INR'
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
