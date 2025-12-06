const Police = require('../models/police');

// @desc    Register a new police officer
// @route   POST /api/auth/police/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            policeId,
            badgeNumber,
            rank,
            department,
            station,
            district,
            phoneNumber,
            dateOfBirth,
            joiningDate
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !policeId || !badgeNumber ||
            !rank || !department || !station || !district || !phoneNumber ||
            !dateOfBirth || !joiningDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if police officer already exists
        const existingPolice = await Police.findOne({
            $or: [{ email }, { policeId }, { badgeNumber }]
        });

        if (existingPolice) {
            return res.status(400).json({
                success: false,
                message: 'Police officer with this email, Police ID, or Badge Number already exists'
            });
        }

        // Create new police officer
        const police = await Police.create({
            name,
            email,
            password,
            policeId,
            badgeNumber,
            rank,
            department,
            station,
            district,
            phoneNumber,
            dateOfBirth,
            joiningDate
        });

        // Create session - login immediately
        req.session.userId = police._id;
        req.session.userType = 'police';

        res.status(201).json({
            success: true,
            message: 'Police officer registered successfully.',
            police: {
                id: police._id,
                name: police.name,
                email: police.email,
                policeId: police.policeId,
                badgeNumber: police.badgeNumber,
                rank: police.rank,
                department: police.department,
                station: police.station,
                district: police.district,
                createdAt: police.createdAt
            },
            userType: 'police'
        });
    } catch (error) {
        console.error('Police signup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering police officer'
        });
    }
};

// @desc    Login police officer
// @route   POST /api/auth/police/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find police officer by email
        const police = await Police.findOne({ email });
        if (!police) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await police.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create session (no verification check needed)
        req.session.userId = police._id;
        req.session.userType = 'police';

        res.status(200).json({
            success: true,
            message: 'Login successful',
            police: {
                id: police._id,
                name: police.name,
                email: police.email,
                policeId: police.policeId,
                badgeNumber: police.badgeNumber,
                rank: police.rank,
                department: police.department,
                station: police.station,
                district: police.district,
                verified: police.verified,
                createdAt: police.createdAt
            },
            userType: 'police'
        });
    } catch (error) {
        console.error('Police login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

// @desc    Logout police officer
// @route   POST /api/auth/police/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error logging out'
                });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        });
    } catch (error) {
        console.error('Police logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out'
        });
    }
};

// @desc    Get current police officer
// @route   GET /api/auth/police/me
// @access  Private
exports.getCurrentPolice = async (req, res) => {
    try {
        const police = await Police.findById(req.session.userId).select('-password');

        if (!police) {
            return res.status(404).json({
                success: false,
                message: 'Police officer not found'
            });
        }

        res.status(200).json({
            success: true,
            police: {
                id: police._id,
                name: police.name,
                email: police.email,
                policeId: police.policeId,
                badgeNumber: police.badgeNumber,
                rank: police.rank,
                department: police.department,
                station: police.station,
                district: police.district,
                phoneNumber: police.phoneNumber,
                dateOfBirth: police.dateOfBirth,
                joiningDate: police.joiningDate,
                profilePicture: police.profilePicture,
                createdAt: police.createdAt
            },
            userType: 'police'
        });
    } catch (error) {
        console.error('Get current police error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching police data'
        });
    }
};
