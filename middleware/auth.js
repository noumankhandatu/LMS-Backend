const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

// Authentication Checker
const isAuthenticated = async (req, res, next) => {
  try {
    // Retrieve the access token from the cookie
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "No login account found" });
    }
    // Verify the access token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid access token" });
      }
      // Check if the user exists in the database
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach the user object to the request for further use
      req.user = user;
      // Continue to the next middleware or route handler
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Validate user  role

const authorizationRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .send(`User role ${req.user.role} is not allowed to access this resource`);
    }
    next();
  };
};

module.exports = { isAuthenticated, authorizationRole };
