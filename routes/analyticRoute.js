const express = require("express");
const AnalyticRoute = express.Router();
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const {
  getUserAnalytics,
  getOrderAnalytics,
  getCoursesAnalytics,
} = require("../controllers/analyticController");

AnalyticRoute.get(
  "/get-users-analytics",
  isAuthenticated,
  authorizationRole("admin"),
  getUserAnalytics
);
AnalyticRoute.get(
  "/get-orders-analytics",
  isAuthenticated,
  authorizationRole("admin"),
  getOrderAnalytics
);

AnalyticRoute.get(
  "/get-courses-analytics",
  isAuthenticated,
  authorizationRole("admin"),
  getCoursesAnalytics
);
module.exports = { AnalyticRoute };
