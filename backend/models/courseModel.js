const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A course must have a name"],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, "A course must have a subject"],
    uppercase: true,
    trim: true,
  },
  number: {
    type: Number,
    required: [true, "A course must have a course number"],
    max: [999, "Course number must be less than or equal to 999"],
  },
  year: {
    type: Number,
    required: [true, "A course must have a year"],
  },
  term: {
    type: String,
    required: [true, "A course must have a term"],
    enum: {
      values: ["Fall", "Spring", "Winter", "Summer"],
    },
  },
  key: {
    type: String,
    required: [true, "A course must have a key"],
    unique: true,
    validate: {
      validator: function (val) {
        return (
          val ===
          this.subject +
            this.number +
            "-" +
            this.term.slice(0, 2).toUpperCase() +
            this.year
        );
      },
      message:
        "A course key must be in the format <Subject Code><Course number>-<FA/SP/WI/SU><Year>. Ex. ECE391-FA2021.",
    },
  },
  faqs: [
    {
      question: String,
      answer: String,
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Review",
    },
  ],
  sections: [
    {
      professor: {
        type: mongoose.Schema.ObjectId,
        ref: "Professor",
      },
      profName: {
        type: String,
        required: true,
      },
      avgGPA: {
        type: Number,
        required: true,
        min: [0.0, "Avg GPA must be greater than or equal to 0.0"],
        max: [4.0, "Avg GPA must be less than or equal to 4.0"],
      },
      classSize: {
        type: Number,
        required: true,
      },
      distribution: {
        type: [Number],
        validate: {
          validator: function (val) {
            return val.length === 13;
          },
          message:
            "distribution must have length 13. One value for: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F",
        },
      },
    },
  ],
});

courseSchema.pre("findOne", function (next) {
  this.populate({
    path: "reviews",
  });
  next();
});

courseSchema.pre(/^find/, function (next) {
  this.select({
    "sections._id": 0,
  });
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
