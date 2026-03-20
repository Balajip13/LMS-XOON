import Settings from '../models/Settings.js';

const maintenanceMode = async (req, res, next) => {
    try {
        const settings = await Settings.findOne();

        if (settings && settings.maintenanceMode) {
            // Allow admins to bypass maintenance mode
            if (req.user && req.user.role === 'admin') {
                return next();
            }

            return res.status(503).json({
                message: 'System is currently under maintenance. Please try again later.',
                maintenance: true
            });
        }

        next();
    } catch (error) {
        next();
    }
};

export { maintenanceMode };
