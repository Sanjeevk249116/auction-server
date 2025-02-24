const mongoose = require("mongoose");
const catalogueActivitySchema = new mongoose.Schema(
  {
    catalogue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "catalogueModel",
    },
    activityType: {
      type: String,
      enum: [
        "downloadedBy",
        "viewedBy",
        "tradersRejected",
        "tradersConfirmed",
        "commands",
      ],
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
    commands: { type: String },
    rejectCammands: [{ type: String }],
  },
  { timestamps: true }
);

const catalogueActivity = mongoose.model(
  "catalogueActivity",
  catalogueActivitySchema
);

module.exports = { catalogueActivity };
