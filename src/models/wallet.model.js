const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    bankAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bankAccountModel",
      },
    ],
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profileModel",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const walletModel = mongoose.model("walletModel", walletSchema);
module.exports = { walletModel };
