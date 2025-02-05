const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
require("dotenv").config();

const validAuth = asyncHandler(async (req, res, next) => {
  const token = req.header("auth-Token");
  if (!token) {
    throw new ApiError(401, "Access denied!");
  }

  const decodedUserToken = jwt.verify(token, process.env.AUCTION_TOKEN_SECRET);
  const currentTime = Math.floor(Date.now() / 1000);
  if (decodedUserToken.exp && decodedUserToken.exp < currentTime) {
    throw new ApiError(403, "Token expired.");
  }

  req.userId = decodedUserToken?._id;
  next();
});

module.exports = { validAuth };
