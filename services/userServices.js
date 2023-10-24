// get user by id
const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const UserModel = require("../models/userModel");
const CourseModel = require("../models/courseModel");

const getUserById = async (userId, res) => {
  const user = await UserModel.findById(userId);

  return res.status(200).send({
    message: "Success",
    user,
  });
};

// get all users
const getAllUsersServices = expressAsyncHandler(async (res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return res.status(200).send({ message: "Success", users });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// update  user role
const updateUserRoleService = expressAsyncHandler(async (res, id, role) => {
  try {
    const users = await UserModel.findByIdAndUpdate(id, { role }, { new: true });
    if (users) {
      return res.status(200).send({ message: "Role Update Successfully", users });
    }
    if (!users) {
      return res.status(200).send({ message: "User not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = { getUserById, getAllUsersServices, updateUserRoleService };
