const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    PCB: {
      type: String,
      required: true,
    },
    GST: {
      type: String,
      required: true,
    },
    GoodsAndServicesTax: {
      type: String,
      required: true,
    },
    PANCard: {
      type: String,
      required: true,
    },
    KYC: {
      type: String,
      required: true,
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
