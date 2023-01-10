const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router(); // creates router

router
    .route('/')
    .get(courseController.getAllCourses)
    .post(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        courseController.createCourse
    );
router
    .route('/:id')
    .get(courseController.getCourse)
    .patch(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        courseController.updateCourse
    )
    .delete(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        courseController.deleteCourse
    );

module.exports = router;
