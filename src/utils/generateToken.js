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

  

