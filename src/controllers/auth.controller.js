const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const { getUserFromAuthService } = require("../config/authDetails");
const { ApiResponse } = require("../utils/apiResponse");
const { profileModel } = require("../models/profile.models");

const generateToken = async (userId) => {
  try {
    const profile = await profileModel.findById(userId);
    if (!profile) {
      throw new ApiError(400, "User does not exist");
    }
    const auctionToken = await profile.generateAccessToken();
    profile.auctionToken = auctionToken;
    profile.save({ validateBeforeSave: false });
    return { auctionToken };
  } catch (error) {
    await profileModel.findOneAndDelete(userId);
    throw new ApiError(500, "Internal server error while generating token");
  }
};

const auctionAuthenticate = asyncHandler(async (req, res) => {
  const user = await getUserFromAuthService(req.userId);
  let profile = {};
  profile = await profileModel.findOne({
    $or: [{ email: user.email }, { phoneNumber: user.phoneNumber }],
  });

  if (!profile) {
    profile = await profileModel.create({
      email: user.email,
      userName: user.name,
      phoneNumber: user.phoneNumber,
    });
  }

  const auctionToken = await generateToken(profile?._id);
  return res.status(200).json(auctionToken?.auctionToken);
});

const profileLogout = asyncHandler(async (req, res) => {
  try {
    await profileModel.findByIdAndUpdate(
      req.userId,
      {
        $unset: {
          auctionToken: "",
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(new ApiResponse(200, "logout successfully."));
  } catch (error) {
    throw new ApiError(400, "Unable to logout this session");
  }
});

module.exports = { auctionAuthenticate, profileLogout };
