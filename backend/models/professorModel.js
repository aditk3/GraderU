const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    courses: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Course',
        },
    ],
});

professorSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'courses',
        select: '_id name subject number term year',
    });
    next();
});

const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;
