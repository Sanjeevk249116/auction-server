const { default: mongoose } = require("mongoose");
const { auctionModel } = require("../../models/auction");
const { catalogueActivity } = require("../../models/catalogueActivity");
const { catalogueModel } = require("../../models/catalogueModel");
const { coordinatorModel } = require("../../models/coordinator");
const { documentUploadModel } = require("../../models/document");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { offersModel } = require("../../models/offer");
const { subscriptionmodels } = require("../../models/Subscription.model");

const createCoordinator = asyncHandler(async (req, res) => {
  try {
    const { name, phoneNumber, email, address, position, languages } = req.body;
    if (
      !(
        name ||
        phoneNumber ||
        email ||
        address ||
        address ||
        position ||
        languages
      )
    ) {
      throw new ApiError(400, "All field are required.");
    }
    const coordinator = await coordinatorModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (coordinator) {
      throw new ApiError(
        400,
        "coordinator email or phone number already exist."
      );
    }

    await coordinatorModel.create({
      name,
      phoneNumber,
      email,
      address,
      position,
      languages,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Create coordinator successfully."));
  } catch (error) {
    throw new Error(400, "failed to create coordinator.");
  }
});

const updateCoordinator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email, address, position, languages } = req.body;

    if (
      !(
        name ||
        phoneNumber ||
        email ||
        address ||
        address ||
        position ||
        languages
      )
    ) {
      throw new ApiError(400, "All field are required.");
    }

    await coordinatorModel.findOneAndUpdate(
      { _id: id },
      { name, phoneNumber, email, address, position, languages }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Update coordinator successfully."));
  } catch (error) {
    throw new ApiError(400, "Something failed in update coordinator.");
  }
});

const verifyDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const verifiedDocument = await documentUploadModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "verified",
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(new ApiResponse(200, verifiedDocument));
  } catch (error) {
    throw new ApiError(400, "failed to verify document.");
  }
});

const rejectDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const rejectedDocument = await documentUploadModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "rejected",
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(new ApiResponse(200, rejectedDocument));
  } catch (error) {
    throw new ApiError(400, "failed to verify document.");
  }
});

const approvedCatalogue = asyncHandler(async (req, res) => {
  const { auctionId, id } = req.params;
  const userId = req.userId;
  const auction = await auctionModel.findById(auctionId);
  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }
  const catalogue = await catalogueModel.findByIdAndUpdate(
    id,
    {
      $set: {
        "industryApproval.status": "approval",
        "industryApproval.approvalId": userId,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(new ApiResponse(200, catalogue));
});

const notApprovedCatalogue = asyncHandler(async (req, res) => {
  const { auctionId, id } = req.params;
  const { message } = req.body;
  const userId = req.userId;
  const auction = await auctionModel.findById(auctionId);
  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }
  const catalogue = await catalogueModel.findByIdAndUpdate(
    id,
    {
      $set: {
        "industryApproval.status": "notApproval",
        "industryApproval.approvalId": userId,
      },
    },
    {
      new: true,
    }
  );
  const catalogueActivitys = await catalogueActivity.create({
    catalogue: catalogue._id,
    activityType: "commands",
    profile: userId,
    commands: message,
  });

  const catalogueDetails = await catalogueModel.findByIdAndUpdate(id, {
    $push: { activityId: catalogueActivitys._id },
  });
  return res.status(200).json(new ApiResponse(200, catalogueDetails));
});

const startingPriceUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { offers } = req.body;

  const auction = await auctionModel.findById(id);
  if (!auction) {
    throw new ApiError(404, "Auction not found!.");
  }
  const OffersDetails = await offersModel.find({ auctionId: id });
  OffersDetails.forEach(async (item) => {
    const matchingOffer = offers.find(
      (offerItems) => offerItems.offer.toString() === item._id.toString()
    );
    if (matchingOffer) {
      item.startingPrice = matchingOffer.startingPrice;
      await item.save({ validateBeforeSave: false });
    }
  });

  await auctionModel.findByIdAndUpdate(id, {
    "startingPriceApproval.status": "pending",
    "startingPriceApproval.profile": null,
  });

  return res.status(200).json(new ApiResponse(200, OffersDetails));
});

const updateSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    afterDiscountPrice,
    numberOfYears,
    price,
    savingsPercentage,
    recommended,
    features,
    name,
  } = req.body;
  const subscription = await subscriptionmodels.findById(id);
  if (!subscription) {
    throw new ApiError(400, "Subscription are not found.");
  }
  try {
    const newSubscription = await subscriptionmodels.findByIdAndUpdate(
      id,
      {
        afterDiscountPrice,
        numberOfYears,
        price,
        savingsPercentage,
        recommended,
        features,
        name,
      },
      { new: true }
    );
    return res.status(200).json(200, new ApiResponse(200, newSubscription));
  } catch (error) {
    throw new ApiError(400, "Failed to update subscription.");
  }
});

const archivedSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionmodels.findById(id);
  if (!subscription) {
    throw new ApiError(400, "Subscription not found.");
  }
  await subscriptionmodels.findByIdAndUpdate(id, {
    archived: true,
  });
  return res
    .status(200)
    .json(200, ApiResponse(200, "plan archived successfully."));
});

const unarchivedSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionmodels.findById(id);
  if (!subscription) {
    throw new ApiError(400, "Subscription not found.");
  }
  await subscriptionmodels.findByIdAndUpdate(id, {
    archived: false,
  });
  return res
    .status(200)
    .json(200, ApiResponse(200, "plan unarchived successfully."));
});

module.exports = {
  createCoordinator,
  updateCoordinator,
  verifyDocument,
  rejectDocument,
  approvedCatalogue,
  notApprovedCatalogue,
  startingPriceUpdate,
  updateSubscription,
  archivedSubscriptionPlan,
  unarchivedSubscriptionPlan
};
