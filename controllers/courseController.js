const asyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const cloudinary = require("cloudinary");
const { createCourse } = require("../services/courseServices");
const CourseModel = require("../models/courseModel");
const { default: mongoose } = require("mongoose");
const NotificationModel = require("../models/notificationModel");
// upload course
const uploadCourse = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });
      thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      console.log(myCloud, "myCloud  uploader");
    }
    createCourse(data, res);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
// edit course

const editCourse = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      // delete thumbnail
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);
      // upload new thumbnail
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });
      thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    // to edit anything in backend we need its id so we get id from params
    const courseID = req.params.id;
    if (!courseID) {
      return res.status(400).send({ message: "bad request  , param is missing required" });
    }

    const course = await CourseModel.findByIdAndUpdate(courseID, { $set: data }, { new: true });

    return res.status(201).send({ message: "Course updated successfully", data });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// get single course ---- without purchase ----
const getSingleCourse = asyncHandler(async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId).select(
      "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
    );
    console.log(course);
    res.status(200).send({ message: "Successfull", course });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
// get all course ---- without purchase ----

const getAllCourses = asyncHandler(async (req, res) => {
  try {
    const course = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
    );
    return res.status(200).send({ message: "Success fetched all courses", course });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// get user courses
const getCourseByUser = asyncHandler(async (req, res) => {
  try {
    // we are getting it from because we saved user remember ? req.user = user  it is in UpdateAccessToken api
    const userCourseList = req?.user?.courses;
    const courseId = req.params.id;
    const courseExists = await userCourseList?.find((course) => course.id.toString() === courseId);

    // if user didnt not purchase the course we will show this
    if (!courseExists) {
      return res.status(404).send({ message: "You are not allowed to this courses " });
    }
    const course = await CourseModel.findById(courseId);
    const courseContent = course.courseData;
    return res.status(200).send({ message: "Success!", courseContent });
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, error);
  }
});

// add questions in  course
const addQuestions = asyncHandler(async (req, res) => {
  try {
    const { question, courseId, contentId } = req.body;
    const course = await CourseModel.findById(courseId);
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res
        .status(400)
        .send({ message: "Content ID is not a valid or written in bad practice" });
    }
    const courseContent = course?.courseData?.find((item) => item._id.equals(contentId)); //item._id.toString() === contentId we can do it like this as well or use equals
    // create a new question object
    const newQuestion = {
      user: req.user,
      question,
      questionReplies: [],
    };
    //  add the above to course content
    courseContent.questions.push(newQuestion);

    // save updated course content
    await course?.save();
    await NotificationModel.create({
      user: req.user?._id,
      title: "New Question added in course",
      message: `You have a new Question from ${courseContent?.title}`,
    });
    return res
      .status(200)
      .send({ message: "Question updated successfully", question: newQuestion });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// add answer in course
const addAnswers = asyncHandler(async (req, res) => {
  try {
    const { answer, questionId, courseId, contentId } = req.body;
    const course = await CourseModel.findById(courseId);

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res
        .status(400)
        .send({ message: "Content ID is not a valid or written in bad practice" });
    }
    const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));

    const question = courseContent?.questions?.find((item) => item._id.equals(questionId));

    if (!question) {
      return res.status(400).message({ send: "Invalid question id" });
    }

    const newAnswer = {
      user: req.user,
      answer,
    };
    question.questionReplies.push(newAnswer);
    await course?.save();
    await NotificationModel.create({
      user: req.user?._id,
      title: "You replied to a question",
      message: `You have replied to question in the ${courseContent?.title}`,
    });
    return res.status(200).json({ message: "Success!", course });
  } catch (error) {
    return res.status(400).send({ message: "Cant added question error" });
  }
});

// add review
const addReview = asyncHandler(async (req, res) => {
  try {
    const userCourseList = req.user.courses;

    const courseId = req.params.id;
    // check course id already exists
    const courseExists = userCourseList?.some(
      (course) => course._id.toString() === courseId.toString()
    );

    if (!courseExists) {
      return res.status(400).send({ message: "you arent elegibly for this course" });
    }

    const course = await CourseModel.findById(courseId);
    const { review, rating } = req.body;
    const reviewData = {
      user: req.user,
      review: review,
      rating,
    };
    course?.review.push(reviewData);
    let avg = 0;
    course.review.forEach((rev) => (avg += rev.rating));
    if (course) {
      // course?.rating = avg/course?.review.length   // e.g if we have 2 reviews one is 5 and other is 4 9/2  =4.5 rating
    }
    await course.save();

    await NotificationModel.create({
      user: req.user?._id,
      title: "You added a review successfully",
      message: `You added a review successfully in the ${courseContent?.title}`,
    });

    // create a notification
    return res.status(200).send({ message: "New Review Released", course });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// add reply to review

const addReplyToReview = asyncHandler(async (req, res) => {
  try {
    const { replyToReview, courseId, reviewId } = req.body;
    const course = await CourseModel.findById(courseId);
    console.log(course.review);

    if (!course) {
      return res.status(400).send({ message: "you arent elegibly for this course" });
    }
    const review = course.review.find((rev) => rev.id.toString() === reviewId);
    if (!review) {
      return res.status(400).send({ message: "Review not found" });
    }
    const replyData = {
      user: req.user,
      replyToReview,
    };
    if (!review?.reviewReply) {
      review.reviewReply = [];
    }
    review?.reviewReply.push(replyData);

    await course.save();
    return res.status(400).send({ message: "Review Reply Saved Successfully", course });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourses,
  getAllCourses,
  getCourseByUser,
  addQuestions,
  addAnswers,
  addReview,
  addReplyToReview,
};
