const mongoose = require("mongoose");
const inspectionRequestSchema = new mongoose.Schema(
  {
    contactPerson: {
      type: String,
    },
    inspectionBy: {
      type: String,
    },
    inspectionLocation: {
      type: String,
    },
    numberOfPeople: {
      type: Number,
    },
    inspectionDate: {
      type: String,
    },
    inspectionCompletedDate: {
      type: String,
    },
    offers: [{ type: mongoose.Schema.Types.ObjectId, ref: "offersModel" }],
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "profileModel" },
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "auctionModel" },
    response: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    requestStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "sended", "rejected", "accepted"],
    },
  },
  { timestamps: true }
);

const inspectionRequestModel = mongoose.model(
  "inspectionRequestModel",
  inspectionRequestSchema
);
module.exports = { inspectionRequestModel };
