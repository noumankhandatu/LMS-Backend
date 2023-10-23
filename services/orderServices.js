const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const OrderModel = require("../models/orderModel");

// create a new order
const newOrder = expressAsyncHandler(async (res, data, next) => {
  console.log(data);
  try {
    const order = await OrderModel.create(data);
    return res.status(201).send({
      message: "Successfully purchased a new course and the course has been added to your ID.",
      order,
    });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = { newOrder };
