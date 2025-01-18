const mongoose = require("mongoose");
const materialSchema = new mongoose.Schema(
  {
    materialClassification: {
      type: String,
    },
  },
  { timestamps: true }
);

const materialClassificationModel = mongoose.model(
  "materialClassificationModel",
  materialSchema
);

module.exports = { materialClassificationModel };
