const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const NotificationModel = require("../models/notificationModel");
const cron = require("node-cron");

// create order
const getAllNotifications = expressAsyncHandler(async (req, res, next) => {
  try {
    // This will send our notifications in reverse order (newest first)
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    res.status(201).send({ message: "Success", notifications });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// update notification status only for admin
const updateNotification = expressAsyncHandler(async (req, res, next) => {
  try {
    const notification = await NotificationModel.findById(req?.params?.id);
    if (!notification) {
      return res.status(400).send({ message: "Notification not found" });
    }
    if (notification.status === "unread") {
      notification.status = "read";
      notification.save();
    }
    res.status(201).send({ message: "Notification updated successfully", notification });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Delete notifications that are older than 30 days
const deleteNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete notifications with a createdAt date older than 30 days
    await NotificationModel.deleteMany({ createdAt: { $lt: thirtyDaysAgo }, status: "read" });
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
};

// Schedule the deleteNotifications function to run daily
cron.schedule("0 0 * * *", () => {
  console.log("Running daily task to delete old notifications");
  deleteNotifications();
});

module.exports = { getAllNotifications, updateNotification };
