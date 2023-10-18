const express = require("express");
const {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourses,
  getCourseByUser,
  addQuestions,
  addAnswers,
  addReview,
} = require("../controllers/courseController");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");

const CourseRoute = express.Router();

CourseRoute.post("/create-course", isAuthenticated, authorizationRole("admin"), uploadCourse);
CourseRoute.put("/edit-course/:id", isAuthenticated, authorizationRole("admin"), editCourse);
CourseRoute.get("/get-course/:id", getSingleCourse);
CourseRoute.get("/get-all-courses", getAllCourses);
CourseRoute.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
CourseRoute.put("/add-questions", isAuthenticated, addQuestions);
CourseRoute.put("/add-answers", isAuthenticated, addAnswers);
CourseRoute.put("/add-review/:id", isAuthenticated, addReview);

module.exports = { CourseRoute };
