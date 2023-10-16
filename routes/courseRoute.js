const express = require("express");
const { uploadCourse } = require("../controllers/courseController");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");

const CourseRoute = express.Router();

CourseRoute.post("/upload-course", isAuthenticated, authorizationRole("admin"), uploadCourse);

module.exports = { CourseRoute };
