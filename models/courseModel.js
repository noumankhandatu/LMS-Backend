const { Schema, model } = require("mongoose");

// review schema
const reviewSchema = new Schema({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  review: String,
  reviewReply: [Object],
});

const linkSchema = new Schema({
  title: String,
  url: String,
});

// question Schema
const questionSchema = new Schema({
  user: Object,
  question: String,
  questionReplies: [Object],
});

const courseDataSchema = new Schema({
  videoUrl: String,
  title: String,
  videoSection: String,
  description: String,
  videoPlayer: String,
  videoLength: String,
  links: [linkSchema],
  suggestions: String,
  questions: [questionSchema],
});

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatePrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    levels: {
      type: String,
      required: true,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    review: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CourseModel = model("CourseModel", courseSchema);
module.exports = CourseModel;
