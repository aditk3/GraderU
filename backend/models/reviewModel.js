const mongoose = require('mongoose');
const Course = require('./courseModel');
const AppError = require('../utils/appError');

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating.'],
        min: [1, 'A rating cannot be lower than 1.'],
        max: [5, 'A rating cannot be higher than 5.'],
    },
    text: {
        type: String,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    dislikes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    professor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Professor',
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
    },
});

reviewSchema.pre('save', async function (next) {
    try {
        await Course.findByIdAndUpdate(this.course, {
            $push: { reviews: this._id },
        });
    } catch (err) {
        return next(new AppError(err.message, 404));
    }

    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
