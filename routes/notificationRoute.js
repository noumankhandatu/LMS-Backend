const express = require("express");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const { getAllNotifications, updateNotification } = require("../controllers/notificationContoller");
const NotificationRoute = express.Router();

NotificationRoute.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizationRole("admin"),
  getAllNotifications
);
NotificationRoute.put(
  "/update-notifications/:id",
  isAuthenticated,
  authorizationRole("admin"),
  updateNotification
);

module.exports = { NotificationRoute };
