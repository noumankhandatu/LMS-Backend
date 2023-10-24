const express = require("express");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const { createOrder, getAllOrderForAdmin } = require("../controllers/orderController");
const OrderRoute = express.Router();

OrderRoute.post("/create-order", isAuthenticated, createOrder);

OrderRoute.get(
  "/get-all-orders-admin",
  isAuthenticated,
  authorizationRole("admin"),
  getAllOrderForAdmin
);

module.exports = { OrderRoute };
