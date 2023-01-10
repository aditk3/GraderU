const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router(); // creates router

router.post('/signup', authController.signup); // route for signup
router.post('/login', authController.login); // route for login
router.get('/logout', authController.logout); // route for logout
router.post('/forgotPassword', authController.forgotPassword); // route for forgot password
router.patch('/resetPassword', authController.resetPassword); // route for reset password

// all routes beyond this require user to be login
router.use(authController.protect);

router.post('/requestVerification', authController.requestVerification); // route for requesting verification
router.patch('/verify', authController.verify); // route for verifying
router.patch('/updateMe', userController.updateMe);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

// all routes beyond this require admin priviledges
router.use(authController.restrictTo('Verified', 'Admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
