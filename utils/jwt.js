const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);

let accessTokenOptions = {
  // this time means 5 mins
  // 5 * 60 mean 5 mins
  expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
  maxAge: accessTokenExpires * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: true,
};

let refreshTokenOptions = {
  // for days 3 days only
  // 3 * 24 means 3 days
  expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: true,
};

const sendToken = (user, statusCode, res) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  if (process.env.NODE_ENV !== "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({ user, accessToken });
  //   only set secure to true in production
};

module.exports = { sendToken, accessTokenOptions, refreshTokenOptions };
