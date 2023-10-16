const asyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const cloudinary = require("cloudinary");
const { createCourse } = require("../services/courseServices");
// upload course
const uploadCourse = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      }); 
      console.log(myCloud, "myCloud  uploader   ");
      thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    createCourse(data, res);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = { uploadCourse };
