const mongoose = require("mongoose");

const orgnizationSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
    },
    organizationId: {
      type: String,
    },
    accountVerify: {
      type: String,
      enum: ["pending", "verified", "blocked"],
      default: "pending",
    },
    organizationSetUp: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
    GSTIN: {
      type: String,
    },
    panCard: {
      type: String,
    },
    location: {
      address: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
    },
    accountType: {
      type: String,
      enum: ["seller", "buyer", "admin"],
      default: "buyer",
    },
    materialClassification: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "materialClassificationModel",
      },
    ],
  },
  { timestamps: true }
);

orgnizationSchema.index({ createdAt: -1 });

const organizationModel = mongoose.model(
  "organizationModel",
  orgnizationSchema
);
module.exports = { organizationModel };
