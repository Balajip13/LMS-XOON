import SystemSetting from '../models/SystemSetting.js';

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    const settings = await SystemSetting.find({});
    // Convert array to object for easier consumption on frontend
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
};

// @desc    Update setting
// @route   PUT /api/settings
// @access  Private/Admin
const updateSetting = async (req, res) => {
    const { key, value } = req.body;

    const setting = await SystemSetting.findOne({ key });

    if (setting) {
        setting.value = value;
        await setting.save();
        res.json(setting);
    } else {
        const newSetting = await SystemSetting.create({ key, value });
        res.status(201).json(newSetting);
    }
};

export { getSettings, updateSetting };
