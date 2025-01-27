const { documentUploadModel } = require("../../models/document");
const { emdModel } = require("../../models/emdModel");
const { offersModel } = require("../../models/offer");
const { organizationModel } = require("../../models/organization.models");
const { walletModel } = require("../../models/wallet.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { checkMissingFields } = require("../../utils/checkFields");
const { uploadOnCloudinary } = require("../../utils/cloudinary");
const { transactionRecord } = require("../commonController/update");

const uploadFiles = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { fileType } = req.body;
  if (!fileType) {
    throw new ApiError(400, "All field are required.");
  }
  const organization = await organizationModel.findOne({
    owner: userId,
  });
  if (!organization) {
    throw new ApiError(400, "organization not found.");
  }
  const fileName = req.file.originalname;
  const fileUrl = await uploadOnCloudinary(req.file.path);
  await documentUploadModel.create({
    fileName,
    fileType,
    fileSize: fileUrl.bytes,
    url: fileUrl.url,
    status: "pending",
    organization: organization._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Document uploaded successfully."));
});

const payEmdDeposit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { offers } = req.body;

  const amount = offers.reduce(
    (total, item) => total + (parseInt(item.EMDAmount || 0, 10) + 100),
    0
  );

  const wallet = await walletModel.findOne({ profile: userId });
  if (wallet.balance < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

  await walletModel.findOneAndUpdate(
    { profile: userId },
    { $inc: { balance: -amount } }
  );

  const emdOffers = offers.map((item) => ({
    profile: userId,
    offers: item.offer,
    auction: id,
    EMDAmount: item.EMDAmount,
  }));

  const emd = await emdModel.insertMany(emdOffers);
  const updatedOffers = await Promise.all(
    emd.map((item) =>
      offersModel.findByIdAndUpdate(
        item.offers,
        {
          $push: { depositedBy: item._id },
        },
        { new: true }
      )
    )
  );
  await transactionRecord(
    userId,
    amount,
    "emd deposite",
    "recent",
    "completed"
  );
  return res.status(200).json(new ApiResponse(200, updatedOffers));
});

const inspectionRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    contactPerson,
    inspectionBy,
    inspectionDate,
    inspectionLocation,
    numberOfPeople,
    offers,
  } = req.body;

  const requiredFields = [
    "contactPerson",
    "inspectionBy",
    "inspectionDate",
    "inspectionDate",
    "inspectionLocation",
    "numberOfPeople",
    "offers",
  ];

  if (offers.length <= 0) {
    throw new ApiError(400, "please the lot for inspection.");
  }

  const missingFields = checkMissingFields(req.body, requiredFields);
  if (missingFields.length > 0) {
    throw new ApiError(400, `missing field is ${missingFields.join(", ")}`);
  }
  const auction = await auctionModel.findById(id);
  if (!auction) {
    throw new ApiError(400, "Auction not found.");
  }
  
});

module.exports = { uploadFiles, payEmdDeposit, inspectionRequest };
