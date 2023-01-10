const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const Professor = require('../models/professorModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB connection successful!');
    });

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/courses.json`, 'utf-8')
);

const professors = JSON.parse(
    fs.readFileSync(`${__dirname}/professors.json`, 'utf-8')
);

const importCourses = async () => {
    try {
        await Course.create(courses);
        console.log('Data loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const importProfessors = async () => {
    try {
        const profCoursePromises = professors.map(async (professor) =>
            Course.find({ key: { $in: professor.courses } })
        );
        console.log('Course promises created! Executing promises!');

        const profCourses = await Promise.all(profCoursePromises);
        console.log('Promises executed! Augmenting professor data!');

        const courseIDs = profCourses.map((courses) =>
            courses.map((course) => course._id)
        );

        const cleanedProfs = professors.map((prof, idx) => {
            prof.courses = courseIDs[idx];
            return prof;
        });
        console.log('Profesor data augmented! Saving to database!');

        await Professor.create(cleanedProfs);
        console.log('Data Saved!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const linkProfessors = async () => {
    try {
        console.log('Fetching Professors!');
        const professors = await Professor.find();
        console.log('Professors fetched! Generating promises!');

        const linkPromises = professors.map((professor) =>
            Course.updateMany(
                { 'sections.profName': professor.name },
                { $set: { 'sections.$.professor': professor._id } },
                (arrayFilters = { 'sections.profName': professor.name })
            )
        );
        console.log('Promises generated! Executing Promises!');

        await Promise.all(linkPromises);
        console.log('Professors Linked!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async (model) => {
    try {
        await model.deleteMany();
        console.log('Data deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    if (process.argv[3] === 'courses') {
        importCourses();
    } else if (process.argv[3] === 'professors') {
        importProfessors();
        linkProfessors();
    } else {
        console.log('Invalid argument!');
    }
} else if (process.argv[2] === '--delete') {
    if (process.argv[3] === 'courses') {
        deleteData(Course);
    } else if (process.argv[3] === 'professors') {
        deleteData(Professor);
    } else {
        console.log('Invalid argument!');
    }
}
