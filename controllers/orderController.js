const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const UserModel = require("../models/userModel");
const CourseModel = require("../models/courseModel");
const NotificationModel = require("../models/notificationModel");
const { newOrder, getAllOrdersServices } = require("../services/orderServices");

const sendMail = require("../utils/sendMail");

const ejs = require("ejs");
const path = require("path");
const OrderModel = require("../models/orderModel");
const { generateLast12MonthData } = require("../utils/analyticGenerator");
// create order
const createOrder = expressAsyncHandler(async (req, res, next) => {
  try {
    const { courseId, paymentInfo } = req.body;
    const userId = req?.user?._id;
    const user = await UserModel.findById(userId);
    // if user already purchased the course or not
    const courseExistsInUser = user.courses.some((course) => course._id.toString() === courseId);
    if (courseExistsInUser) {
      return res.status(400).send({ message: "You already purchased the course" });
    }
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res
        .status(400)
        .send({ message: "Course not found if we create a course we will let you know" });
    }

    const data = {
      courseId: course?._id,
      userId: user?._id,
      paymentInfo,
    };
    // when order is done we need confirmation mail
    const mailData = {
      order: {
        _id: course?._id.toString().slice(0, 6),
        name: course?.name,
        price: course?.price,
        date: new Date().toLocaleDateString("en-US", {
          // this will give todays date like  20232 nov 20
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), {
      order: mailData,
    });

    try {
      if (user) {
        await sendMail({
          email: user.email,
          subject: "Order confirmation",
          template: "order-confirmation.ejs",
          data: mailData,
        });
      }
    } catch (error) {
      handleErrorResponse(res, error);
    }
    // after sending the mail we need to add course in user
    // what user purchased add that course
    user.courses.push(course?._id);

    await user.save();
    // we need notification
    await NotificationModel.create({
      user: user?._id,
      title: "New Order",
      message: `You have a new order from ${course.name}`,
    });
    if (course) {
      course.purchased += 1;
    }
    await course.save();
    newOrder(res, data, next);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
// get all courses only for admin
const getAllOrderForAdmin = expressAsyncHandler(async (req, res) => {
  try {
    getAllOrdersServices(res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = { createOrder, getAllOrderForAdmin };
