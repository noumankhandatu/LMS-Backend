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

module.exports = { createCourse };
 