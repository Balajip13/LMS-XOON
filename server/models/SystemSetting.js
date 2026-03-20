import mongoose from 'mongoose';

const systemSettingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'logo', 'siteName'
    value: { type: String, required: true },
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting;
