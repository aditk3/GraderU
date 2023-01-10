const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');
const Course = require('../models/courseModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.createReview = catchAsync(async (req, res, next) => {
    req.body.author = req.user._id;
    const newDoc = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newDoc,
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const { like } = req.body;

    if (![-1, 0, 1].includes(like)) {
        return next(new AppError('Like field must be -1, 0, or 1.', 404));
    }

    if (like === -1) {
        await Review.findByIdAndUpdate(req.params.id, {
            $pull: { likes: req.user._id },
            $addToSet: { dislikes: req.user._id, $sort: 1 },
        });
    } else if (like === 0) {
        await Review.findByIdAndUpdate(req.params.id, {
            $pull: { likes: req.user._id, dislikes: req.user._id },
        });
    } else {
        await Review.findByIdAndUpdate(req.params.id, {
            $pull: { dislikes: req.user._id },
            $addToSet: { likes: req.user._id, $sort: 1 },
        });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: review,
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('No document found with that ID', 404));
    }

    if (review.author !== req.user._id && req.user.role !== 'Admin') {
        return next(new AppError('You cannot delete this review!', 404));
    }

    await Review.findByIdAndDelete(req.params.id);

    await Course.findByIdAndUpdate(review.course, {
        $pull: { reviews: review._id },
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
