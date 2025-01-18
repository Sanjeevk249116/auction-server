const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const profileSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    verifiedUser: {
      type: Boolean,
      default: false,
    },
    accountSetUp: {
      type: Boolean,
      default: false,
    },
    oragnization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizationModel",
    },
    auctionToken: {
      type: String,
    },
  },
  { timestamps: true }
);

profileSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.AUCTION_TOKEN_SECRET,
    { expiresIn: process.env.AUCTION_TOKEN_EXPIRY }
  );
};

const profileModel = mongoose.model("profileModel", profileSchema);
module.exports = { profileModel };
