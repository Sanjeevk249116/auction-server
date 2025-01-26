const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "failed", "completed"],
      default: "pending",
    },
    category: {
      type: String,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "walletModel",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
    types: {
      type: String,
      enum: ["recent", "refund", "withdraw"],
      default: "recent",
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("transactionModel", transactionSchema);

module.exports = { transactionModel };
