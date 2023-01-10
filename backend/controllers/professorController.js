const factory = require('./handlerFactory');
const Professor = require('../models/professorModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllProfessors = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Professor.find(), req.query)
        .sort() // sort data
        .limitFields() // filter response fields
        .paginate(); // pagination

    if (req.query.name)
        features.query.find({
            name: { $regex: req.query.name, $options: 'i' },
        });
    const docs = await features.query; // execute query

    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: docs,
    });
});
exports.getProfessor = factory.getOne(Professor);
exports.createProfessor = factory.createOne(Professor);
exports.updateProfessor = factory.updateOne(Professor);
exports.deleteProfessor = factory.deleteOne(Professor);
