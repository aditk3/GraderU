const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router(); // creates router

router.route('/').get(reviewController.getAllReviews).post(
    authController.protect,
    authController.restrictTo('Verified', 'Student'), // restrict to verified accounts with role user
    reviewController.createReview
);
router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.protect,
        authController.restrictTo('Verified', 'Student', 'Admin', 'Professor'), // restrict to verified accounts
        reviewController.updateReview
    )
    .delete(
        authController.protect,
        authController.restrictTo('Verified', 'Admin', 'Student'), // restrict to verified accounts
        reviewController.deleteReview
    );

module.exports = router;
