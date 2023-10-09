// get user by id
const UserModel = require("../models/userModel");

const getUserById = async (userId, res) => {
  const user = await UserModel.findById(userId);

  return res.status(200).send({
    message: "Success",
    user,
  });
};

module.exports = { getUserById };
