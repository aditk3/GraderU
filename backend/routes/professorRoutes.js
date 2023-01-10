const express = require('express');
const professorController = require('../controllers/professorController');
const authController = require('../controllers/authController');

const router = express.Router(); // creates router

router
    .route('/')
    .get(professorController.getAllProfessors)
    .post(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        professorController.createProfessor
    );
router
    .route('/:id')
    .get(professorController.getProfessor)
    .patch(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        professorController.updateProfessor
    )
    .delete(
        authController.protect,
        authController.restrictTo('Verified', 'Admin'),
        professorController.deleteProfessor
    );

module.exports = router;
