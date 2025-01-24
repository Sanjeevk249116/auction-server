const mongoose = require("mongoose");
const bankAccountSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    IFSCCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    bankBranch: {
      type: String,
      required: true,
      trim: true,
    },
    holderName: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "walletModel",
    },
  },
  { timestamps: true }
);
const bankAccountModel = mongoose.model("bankAccountModel", bankAccountSchema);
module.exports = { bankAccountModel };
