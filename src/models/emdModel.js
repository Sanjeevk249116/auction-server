const mongoose = require("mongoose");

const emdSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
    offers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offersModel",
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auctionModel",
    },
    EMDAmount: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const emdModel = mongoose.model("emdModel", emdSchema);
module.exports = { emdModel };
