const mongoose = require("mongoose");

const subscriptionModelSchema = new mongoose.Schema(
  {
    afterDiscountPrice: {
      type: Number,
      required: true,
    },
    numberOfYears: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    savingsPercentage: {
      type: Number,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const subscriptionmodels = mongoose.model(
  "subscriptionmodels",
  subscriptionModelSchema
);
module.exports = { subscriptionmodels };
