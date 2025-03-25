const { default: mongoose } = require("mongoose");
const { auctionModel } = require("../../models/auction");
const { documentUploadModel } = require("../../models/document");
const { emdModel } = require("../../models/emdModel");
const {
  inspectionRequestModel,
} = require("../../models/inspectionRequestModel");
const { offersModel } = require("../../models/offer");
const { organizationModel } = require("../../models/organization.models");
const { walletModel } = require("../../models/wallet.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { checkMissingFields } = require("../../utils/checkFields");
const { uploadOnCloudinary } = require("../../utils/cloudinary");
const { transactionRecord } = require("../commonController/update");
const { profileModel } = require("../../models/profile.models");
const { sendMailToUser } = require("../../utils/sendEmail");
require("dotenv").config();

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
  const currentDate = new Date();

  const auction = await auctionModel.findById(id);
  if (
    new Date(auction.EMDSchedule.lastTime).getTime() < currentDate.getTime()
  ) {
    throw new ApiError(400, "EMD date has expired.");
  }

  const amount = offers.reduce(
    (total, item) => total + (parseInt(item.EMDAmount || 0, 10) + 100),
    0
  );

  const wallet = await walletModel.findOne({ profile: userId });
  if (wallet.balance < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

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

  await walletModel.findOneAndUpdate(
    { profile: userId },
    { $inc: { balance: -amount } }
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
  const userId = req.userId;
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
    throw new ApiError(400, "please select the lot for inspection.");
  }

  const missingFields = checkMissingFields(req.body, requiredFields);
  if (missingFields.length > 0) {
    throw new ApiError(400, `missing field is ${missingFields.join(", ")}`);
  }

  const auction = await auctionModel.findById(id);
  if (!auction) {
    throw new ApiError(400, "Auction not found.");
  }

  const request = await inspectionRequestModel.create({
    contactPerson,
    inspectionBy,
    inspectionDate,
    inspectionLocation,
    numberOfPeople,
    offers,
    auctionId: id,
    profile: userId,
    requestStatus: "sended",
  });
  const inspectionAuction = await auctionModel.updateOne(
    { _id: id },
    {
      $push: { inspectionRequest: request._id },
    }
  );

  const seller = await organizationModel.findById(auction.sellerId);
  const profile = await profileModel.findById(seller.owner);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: profile.email,
    subject: `Request for Inspection of ${auction.auctionId}`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin:
          auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="text-align: center; color: #4CAF50;">Inpection of Auction id ${auction.description}</h2>
      <p>Hello,</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Inspected by:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inspectionBy}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Inspection date:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color:
              red;">${inspectionDate}</strong></td>
        </tr>
           <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Contact Person:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color:
              red;">${contactPerson}</strong></td>
        </tr>
         <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>No.of Peoples:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color:
              red;">${numberOfPeople}</strong></td>
        </tr>
         <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Contact Number:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color:
              red;">${profile.phoneNumber}</strong></td>
        </tr>
      </table>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best Regards,<br><strong> Sanjeev Kushwaha</strong></p>
    </div>
  `,
  };

  await sendMailToUser(mailOptions);

  return res.status(200).json(new ApiResponse(200, inspectionAuction));
});

const sendResponseOfInspection = asyncHandler(async (req, res) => {
  const { inspectionCompletedDate, response } = req.body;
  const { id } = req.params;
  const inspection = await inspectionRequestModel.findById(id);
  if (!inspection) {
    throw new ApiError(400, "Inpection not found.");
  }
  if (inspection.requestStatus !== "accepted") {
    throw new ApiError(400, "Please wait for approval by seller.");
  }
  const updateResponse = await inspectionRequestModel.findByIdAndUpdate(
    id,
    {
      inspectionCompletedDate,
      response,
      status: "approved",
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, updateResponse));
});

module.exports = {
  uploadFiles,
  payEmdDeposit,
  inspectionRequest,
  sendResponseOfInspection,
};
