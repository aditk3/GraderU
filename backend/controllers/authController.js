const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/mailer');

// signs JWT token
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });

// sends signed JWT token
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email & password exit
    if (!email || !password) {
        return next(new AppError('Please provide an email and password', 400));
    }

    // check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // send token
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // Get token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Log in to get access', 401)
        );
    }

    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('This user no longer exists!', 401));
    }

    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please login again.',
                401
            )
        );
    }

    req.user = freshUser;
    next();
});

// restricts chained routes to specified roles
exports.restrictTo =
    (verified = false, ...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permissions to perform this action!',
                    403
                )
            );
        }
        if (roles.includes('Verified') && !req.user.verified) {
            return next(
                new AppError(
                    'You must be verified to perform this action!',
                    403
                )
            );
        }
        next();
    };

exports.requestVerification = catchAsync(async (req, res, next) => {
    const { user } = req;

    const verifyOTP = user.createVerifyOTP();
    await user.save({ validateBeforeSave: false });

    try {
        // sends email with verification code
        await sendMail({
            receiverID: user.email,
            message: `Your verification code is ${verifyOTP}. This is valid for the next 10 minutes.\n`,
        });

        res.status(200).json({
            status: 'Success',
            message:
                'Verification code has been sent to your registered email!',
        });
    } catch (err) {
        user.verifyOTP = undefined; // clears verify code
        user.verifyExpires = undefined; // clears verify code expiration
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending a verification code!', 500)
        );
    }
});

exports.verify = catchAsync(async (req, res, next) => {
    const { email, OTP } = req.body;
    if (!email || !OTP) {
        return next(new AppError('The email or OTP is missing!', 400));
    }

    // hashes requested verification code to check against DB
    const hashedOTP = crypto
        .createHash('sha256')
        .update(OTP.toString())
        .digest('hex');

    // checks hashed verification code against user in DB
    const user = await User.findOne({
        email,
        verifyOTP: hashedOTP,
        verifyExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Email or OTP is invalid or expired', 400));
    }

    // marks user as verified and clears verification request values
    user.verified = true;
    user.verifyOTP = undefined;
    user.verifyExpires = undefined;

    await user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with that email address.', 404)
        );
    }

    const resetOTP = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
        // sends email with password reset code
        await sendMail({
            receiverID: user.email,
            message: `Your password reset code is ${resetOTP}. This is valid for the next 10 minutes.\n`,
        });

        res.status(200).json({
            status: 'Success',
            message:
                'Password reset code has been sent to your registered email!',
        });
    } catch (err) {
        user.passwordResetOTP = undefined; // clears reset code
        user.passwordResetExpires = undefined; // clears reset code expiration
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending a password reset code!',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email, OTP } = req.body;
    if (!email || !OTP) {
        return next(new AppError('The email or OTP is missing!', 400));
    }

    // hashes requested reset code to check against DB
    const hashedOTP = crypto
        .createHash('sha256')
        .update(OTP.toString())
        .digest('hex');

    // checks hashed reset code against user in DB
    const user = await User.findOne({
        email,
        passwordResetOTP: hashedOTP,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Email or OTP is invalid or expired', 400));
    }

    // sets passwords and clears reset values
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    // selects password field to check if current password is valid
    const user = await User.findById(req.user.id).select('+password');

    // ensure password fields are present
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        return next(
            new AppError(
                'The current password, new password, or new password confirm is missing!',
                400
            )
        );
    }

    if (!user.correctPassword(currentPassword, user.password)) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // sets new password values
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();
    createSendToken(user, 200, res);
});
