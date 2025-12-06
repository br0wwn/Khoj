const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const policeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    policeId: {
        type: String,
        required: [true, 'Police ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    badgeNumber: {
        type: String,
        required: [true, 'Badge number is required'],
        unique: true,
        trim: true
    },
    rank: {
        type: String,
        required: [true, 'Rank is required'],
        enum: [
            'Constable',
            'Assistant Sub-Inspector',
            'Sub-Inspector',
            'Inspector',
            'Additional Superintendent',
            'Superintendent',
            'Deputy Inspector General',
            'Additional Inspector General',
            'Inspector General'
        ],
        default: 'Constable'
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    station: {
        type: String,
        required: [true, 'Police station is required'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{11}$/, 'Please enter a valid 11-digit phone number']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required']
    },
    profilePicture: {
        url: {
            type: String,
            default: null
        },
        publicId: {
            type: String,
            default: null
        }
    },
    idDocument: {
        url: {
            type: String,
            default: null
        },
        publicId: {
            type: String,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'police'
});

// Hash password before saving
policeSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
policeSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
policeSchema.methods.toJSON = function () {
    const police = this.toObject();
    delete police.password;
    return police;
};

module.exports = mongoose.models.Police || mongoose.model('Police', policeSchema);