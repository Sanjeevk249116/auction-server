const { auctionModel } = require("../../models/auction");
const { bankAccountModel } = require("../../models/bankAccount.model");
const { profileModel } = require("../../models/profile.models");
const { transactionModel } = require("../../models/transaction");
const { walletModel } = require("../../models/wallet.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { checkMissingFields } = require("../../utils/checkFields");
const { uploadOnCloudinary } = require("../../utils/cloudinary");

const addBankAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { accountNo, bankName, IFCSCode, bankBranch, holderName } = req.body;
  const requiredFields = [
    "accountNo",
    "bankName",
    "IFCSCode",
    "holderName",
    "bankBranch",
  ];
  const missingFields = checkMissingFields(req.body, requiredFields);

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `The following fields are missing or empty: ${missingFields.join(", ")}`
    );
  }
  const wallet = await walletModel.findOne({ profile: userId });
  if (!wallet) {
    throw new ApiError(400, "wallet not found.");
  }

  const accountExist = await bankAccountModel.findOne({ accountNo });
  if (accountExist) {
    throw new ApiError(400, "Account Number already added.");
  }

  const account = await bankAccountModel.create({
    accountNo,
    bankName,
    IFSCCode: IFCSCode,
    bankBranch,
    holderName,
    wallet: wallet._id,
  });

  const updatedWallet = await walletModel.findOneAndUpdate(
    { _id: wallet._id },
    {
      $push: {
        bankAccounts: account._id,
      },
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, updatedWallet));
});

const createTransaction = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { amount, category, types } = req.body;
  const requiredFields = ["amount", "category", "types"];

  const missingFields = checkMissingFields(req.body, requiredFields);
  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `The following fields are missing or empty: ${missingFields.join(", ")}`
    );
  }

  const wallet = await walletModel.findOne({ profile: userId });
  if (!wallet) {
    throw new ApiError(400, "wallet not found.");
  }
  const transaction = await transactionModel.create({
    amount,
    category,
    profile: userId,
    wallet: wallet._id,
    types,
  });
  return res.status(200).json(new ApiResponse(200, transaction));
});

const transactionRecord = async (userId, amount, category, types, status) => {
  const wallet = await walletModel.findOne({ profile: userId });
  if (!wallet) {
    throw new ApiError(400, "wallet not found.");
  }
  await transactionModel.create({
    amount,
    category,
    profile: userId,
    wallet: wallet._id,
    types,
    status,
  });
};

const startingPriceApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const auction = await auctionModel.findById(id);

  if (!auction) {
    throw new ApiError(404, "Auction not found.");
  }

  try {
    const auctionApproval = await auctionModel.updateOne(
      { _id: id },
      {
        "startingPriceApproval.status": "approval",
        "startingPriceApproval.profile": userId,
      },
      { new: true }
    );
    return res.status(200).json(new ApiResponse(200, auctionApproval));
  } catch (error) {
    throw new ApiError(400, "failed to updated starting price approval.");
  }
});

const startingPriceReject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const auction = await auctionModel.findById(id);

  if (!auction) {
    throw new ApiError(404, "Auction not found.");
  }

  try {
    const auctionApproval = await auctionModel.updateOne(
      { _id: id },
      {
        "startingPriceApproval.status": "rejected",
        "startingPriceApproval.profile": userId,
      },
      { new: true }
    );
    return res.status(200).json(new ApiResponse(200, auctionApproval));
  } catch (error) {
    throw new ApiError(400, "failed to updated starting price approval.");
  }
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const profile = await profileModel.findById(userId);
  if (!profile) {
    throw new ApiError(400, "Profile is not exist.");
  }

  const profileImage = req.file.path;
  if (!profileImage) {
    throw new ApiError(400, "Please update profile image.");
  }

  const profileImageUrl = await uploadOnCloudinary(profileImage);
  if (!profileImageUrl.url) {
    throw new ApiError(400, "failed to upload image.");
  }

  profile.profileImage = profileImageUrl.url;
  await profile.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Profile update successfully."));
});

module.exports = {
  addBankAccount,
  createTransaction,
  transactionRecord,
  startingPriceApproval,
  startingPriceReject,
  updateProfileImage,
};
