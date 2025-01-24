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
    url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizationModel",
    },
  },
  { timestamps: true }
);

const documentUploadModel = mongoose.model(
  "documentUploadModel",
  documentSchema
);

module.exports = { documentUploadModel };
