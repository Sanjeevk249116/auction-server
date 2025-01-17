const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const authenticateUser = asyncHandler(async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    throw new ApiError(401, "Access denied!");
  }
  try {
    const decodedUserToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedUserToken.exp && decodedUserToken.exp < currentTime) {
      throw new ApiError(401, "Token expired. Please refresh your token.");
    }
    req.userId = decodedUserToken?._id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired. Please refresh your token.");
    } else {
      throw new ApiError(403, "Invalid token");
    }
  }
});
module.exports = { authenticateUser };
