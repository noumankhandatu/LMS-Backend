const { Schema, model } = require("mongoose");
const orderSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: Object,
    },
  },
  { timestamps: true }
);

const OrderModel = model("OrderModel", orderSchema);

module.exports = OrderModel;
