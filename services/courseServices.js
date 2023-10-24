const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const CourseModel = require("../models/courseModel");

const createCourse = expressAsyncHandler(async (data, res) => {
  try {
    const course = await CourseModel.create(data);
    res.status(201).json({ message: "Successfull", success: true, course });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
// get all courses
const getAllCoursesServices = expressAsyncHandler(async (res) => {
  try {
    const courses = await CourseModel.find().sort({ createdAt: -1 });
    return res.status(200).send({ message: "Success", courses });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
module.exports = { createCourse, getAllCoursesServices };
