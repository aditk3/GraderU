const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: true,
    },
    role: {
        type: String,
        required: [true, 'A user must have a role'],
        default: 'Student',
        enum: {
            values: ['Admin', 'Student', 'Professor'],
        },
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: [8, 'Password must have atleast 8 characters'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        // Validation only works on create/save and not update
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords must match',
        },
    },
    verified: {
        type: Boolean,
        default: false,
        required: [true, 'A user must have a verified status'],
    },
    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetExpires: Date,
    verifyOTP: String,
    verifyExpires: Date,
});

// Query middleware

// encrypts password before saving to DB
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
    // passwordConfirm is required field but the model only vaildates for inputs
});

// updates password changed time when password is updated
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1;
    next();
});

// deselects fields
userSchema.pre(/^find/, function (next) {
    this.select('-__v -passwordChangedAt');
    next();
});

// Document middleware

// compares encrypted passwords
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// checks if JWT token has a valid timestamp
userSchema.methods.changePasswordAfter = function (JWTtimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTtimestamp < changedTimestamp;
    }
    return false;
};

// generates 6 digit reset code
userSchema.methods.createPasswordResetOTP = function () {
    const resetOTP = Math.floor(100000 + Math.random() * 900000);
    this.passwordResetOTP = crypto
        .createHash('sha256')
        .update(resetOTP.toString())
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10mins from now
    return resetOTP;
};

// generates 6 digit verification code
userSchema.methods.createVerifyOTP = function () {
    const verifyOTP = Math.floor(100000 + Math.random() * 900000);
    this.verifyOTP = crypto
        .createHash('sha256')
        .update(verifyOTP.toString())
        .digest('hex');

    this.verifyExpires = Date.now() + 10 * 60 * 1000; // 10mins from now
    return verifyOTP;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
