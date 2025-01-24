const { bankAccountModel } = require("../../models/bankAccount.model");
const { walletModel } = require("../../models/wallet.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { checkMissingFields } = require("../../utils/checkFields");

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

module.exports = { addBankAccount };
