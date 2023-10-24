const expressAsyncHandler = require("express-async-handler");
const { generateLast12MonthData } = require("../utils/analyticGenerator");
const { handleErrorResponse } = require("../middleware/errorHandler");
const UserModel = require("../models/userModel");
const CourseModel = require("../models/courseModel");
const OrderModel = require("../models/orderModel");
const getUserAnalytics = expressAsyncHandler(async (req, res) => {
  try {
    const users = await generateLast12MonthData(UserModel);
    return res.status(200).send({ message: "Successfully generated", users });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
// get order analytics
const getOrderAnalytics = expressAsyncHandler(async (req, res) => {
  try {
    const orders = await generateLast12MonthData(OrderModel);
    return res.status(200).send({ message: "Successfully generated", orders });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
const getCoursesAnalytics = expressAsyncHandler(async (req, res) => {
  try {
    const courses = await generateLast12MonthData(CourseModel);
    return res.status(200).send({ message: "Successfully generated", courses });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = { getUserAnalytics, getOrderAnalytics, getCoursesAnalytics };
