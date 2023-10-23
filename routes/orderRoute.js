const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder } = require("../controllers/orderController");
const OrderRoute = express.Router();

OrderRoute.post("/create-order", isAuthenticated, createOrder);

module.exports = { OrderRoute };
