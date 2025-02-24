const mongoose = require("mongoose");
const catalogueSchema = new mongoose.Schema(
  {
    industryApproval: {
      status: {
        type: String,
        enum: ["notApproval", "approval", "pending"],
        default: "pending",
      },
      approvalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"profileModel"
      },
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    url: {
      type: String,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auctionModel",
    },
    activityId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "catalogueActivity",
      },
    ],
  },
  { timestamps: true }
);

const catalogueModel = mongoose.model("catalogueModel", catalogueSchema);
module.exports = { catalogueModel };
