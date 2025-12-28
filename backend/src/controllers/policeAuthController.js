const Police = require('../models/police');
const authUtils = require('../utils/authUtils');

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
        const fieldsValidation = authUtils.validateRequiredFields(
            {
                name, email, password, policeId, badgeNumber,
                rank, department, station, district, phoneNumber,
                dateOfBirth, joiningDate
            },
            ['name', 'email', 'password', 'policeId', 'badgeNumber',
             'rank', 'department', 'station', 'district', 'phoneNumber',
             'dateOfBirth', 'joiningDate']
        );
        if (!fieldsValidation.isValid) {
            return authUtils.sendErrorResponse(res, 400, fieldsValidation.message);
        }

        // Validate password
        const passwordValidation = authUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            return authUtils.sendErrorResponse(res, 400, passwordValidation.message);
        }

        // Check if police officer already exists
        const existingPolice = await Police.findOne({
            $or: [{ email }, { policeId }, { badgeNumber }]
        });

        if (existingPolice) {
            return authUtils.sendErrorResponse(res, 400, 'Police officer with this email, Police ID, or Badge Number already exists');
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
        await authUtils.createSession(req, police._id, 'police');

        authUtils.sendSuccessResponse(res, 201, 'Police officer registered successfully.', {
            police: authUtils.formatUserResponse(police, 'police'),
            userType: 'police'
        });
    } catch (error) {
        authUtils.sendErrorResponse(res, 500, error.message || 'Error registering police officer', error);
    }
};

// @desc    Login police officer
// @route   POST /api/auth/police/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate credentials
        const credentialsValidation = authUtils.validateLoginCredentials(email, password);
        if (!credentialsValidation.isValid) {
            return authUtils.sendErrorResponse(res, 400, credentialsValidation.message);
        }

        // Find police officer by email
        const police = await Police.findOne({ email });
        if (!police) {
            return authUtils.sendErrorResponse(res, 401, 'Invalid email or password');
        }

        // Check password
        const isPasswordValid = await police.comparePassword(password);
        if (!isPasswordValid) {
            return authUtils.sendErrorResponse(res, 401, 'Invalid email or password');
        }

        // Create session (no verification check needed)
        await authUtils.createSession(req, police._id, 'police');

        authUtils.sendSuccessResponse(res, 200, 'Login successful', {
            police: authUtils.formatUserResponse(police, 'police'),
            userType: 'police'
        });
    } catch (error) {
        authUtils.sendErrorResponse(res, 500, 'Error logging in', error);
    }
};

// @desc    Logout police officer
// @route   POST /api/auth/police/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        await authUtils.destroySession(req, res);
        authUtils.sendSuccessResponse(res, 200, 'Logout successful');
    } catch (error) {
        authUtils.sendErrorResponse(res, 500, 'Error logging out', error);
    }
};

// @desc    Get current police officer
// @route   GET /api/auth/police/me
// @access  Private
exports.getCurrentPolice = async (req, res) => {
    try {
        const police = await Police.findById(req.session.userId).select('-password');

        if (!police) {
            return authUtils.sendErrorResponse(res, 404, 'Police officer not found');
        }

        authUtils.sendSuccessResponse(res, 200, 'Police data fetched successfully', {
            police: authUtils.formatUserResponse(police, 'police'),
            userType: 'police'
        });
    } catch (error) {
        authUtils.sendErrorResponse(res, 500, 'Error fetching police data', error);
    }
};
