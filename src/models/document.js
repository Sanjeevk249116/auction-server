const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
  },
  { timestamps: true }
);

const documentUploadModel = mongoose.model(
  "documentUploadModel",
  documentSchema
);

module.exports = { documentUploadModel };
