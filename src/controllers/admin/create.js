const { auctionModel } = require("../../models/auction");
const { ApiError } = require("../../utils/apiError");
const { addDateAndTime } = require("../../helper");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { offersModel } = require("../../models/offer");
const { uploadOnCloudinary } = require("../../utils/cloudinary");
const { scrapImageModels } = require("../../models/scrapImage.model");
const { materialClassificationModel } = require("../../models/MaterialScrap");
const { catalogueModel } = require("../../models/catalogueModel");
const { checkMissingFields } = require("../../utils/checkFields");
const { subscriptionmodels } = require("../../models/Subscription.model");

const createAuction = asyncHandler(async (req, res) => {
  const {
    EMDSchedule,
    inspectionSchedule,
    auctionSchedule,
    location,
    auctionType,
    auctionCoordinators,
    contractValidity,
    bidValidity,
    auctionRegion,
    auctionMode,
    description,
  } = req.body;
  const { id } = req.params;

  const auctionDateAndTime = {
    startDate: auctionSchedule.startDate,
    startingTime: addDateAndTime(
      auctionSchedule.startDate,
      auctionSchedule.startingTime
    ),
    endingTime: addDateAndTime(
      auctionSchedule.startDate,
      auctionSchedule.endingTime
    ),
  };

  const inspectionDetails = {
    inspectionLocation: inspectionSchedule.inspectionLocation,
    endDate: inspectionSchedule.endDate,
    startingTime: addDateAndTime(
      inspectionSchedule.startDate,
      inspectionSchedule.startingTime
    ),
    endingTime: addDateAndTime(
      inspectionSchedule.startDate,
      inspectionSchedule.endingTime
    ),
  };
  const emdDetails = {
    lastDate: EMDSchedule.lastDate,
    lastTime: addDateAndTime(EMDSchedule.lastDate, EMDSchedule.lastTime),
  };

  const auctionDetails = await new auctionModel({
    EMDSchedule: emdDetails,
    inspectionSchedule: inspectionDetails,
    auctionSchedule: auctionDateAndTime,
    location,
    auctionType,
    auctionCoordinators,
    contractValidity,
    bidValidity,
    auctionRegion,
    auctionMode,
    description,
    sellerId: id,
  });

  const savedAuction = await auctionDetails.save();

  return res
    .status(200)
    .json(new ApiResponse(200, savedAuction, "auction created successfully."));
});

const createOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const auction = await auctionModel.findById(id);
  if (!auction) {
    throw new ApiError(400, "Auction not found.");
  }
  const {
    location,
    EMDAmount,
    scrapDetails,
    maximumBid,
    minimumBid,
    liftingPeriod,
    ItTCSTaxes,
    GSTTaxes,
    offerSchedule,
    requiresPCBCertificate,
    description,
    startingPrice,
  } = req.body;

  const scrapDetailValue = JSON.parse(scrapDetails);
  const offerSchedules = JSON.parse(offerSchedule);

  // const scrapType = await offersModel.findOne({
  //   "scrapDetails.type": scrapDetailValue.type,
  // });
  // if (scrapType) {
  //   throw new ApiError(400, "Scrap type is already added.");
  // }

  const offerTime = {
    startingTime: addDateAndTime(
      auction?.auctionSchedule.startDate,
      offerSchedules.startingTime
    ),
    endingTime: addDateAndTime(
      auction?.auctionSchedule.startDate,
      offerSchedules.endingTime
    ),
  };

  const offer = await offersModel({
    location,
    EMDAmount,
    scrapDetails: scrapDetailValue,
    maximumBid,
    minimumBid,
    liftingPeriod,
    ItTCSTaxes,
    GSTTaxes,
    offerSchedule: offerTime,
    requiresPCBCertificate,
    description,
    startingPrice,
    auctionId: id,
  });
  const saveOffer = await offer.save();
  if (!saveOffer) {
    throw new ApiError(400, "Something failed during create offer.");
  }

  if (req.files?.photo1?.length > 0) {
    try {
      const photos = {};
      const uploadedPhotoUrls = {};

      // Iterate over the photo keys dynamically
      for (let i = 1; i <= 5; i++) {
        const photoKey = `photo${i}`;
        const photoFile = req.files?.[photoKey]?.[0]?.path;

        // Only process if the photo exists
        if (photoFile) {
          const photoUrl = await uploadOnCloudinary(photoFile);
          uploadedPhotoUrls[photoKey] = photoUrl.url;
        }
      }
      // Only save non-empty fields in the database
      const uploadOfferImage = await scrapImageModels.create(uploadedPhotoUrls);
      // Update the offer model with the new image references
      await offersModel.findByIdAndUpdate(
        saveOffer?._id,
        {
          $set: { offerImage: uploadOfferImage?._id },
        },
        {
          new: true,
        }
      );
    } catch (error) {
      await offersModel.findByIdAndDelete(saveOffer?._id);
      throw new ApiError(500, "Internal server error while uploading photos.");
    }
  }

  const auctionDetails = await auctionModel.findByIdAndUpdate(
    id,
    {
      $push: {
        offers: saveOffer._id,
      },
    },
    { new: true }
  );

  if (!auctionDetails) {
    throw new ApiError(400, "Something failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Offer created successfully."));
});

const addMaterialClassification = asyncHandler(async (req, res) => {
  const { materialClassification } = req.body;
  if (
    !Array.isArray(materialClassification) ||
    materialClassification.length === 0
  ) {
    throw new ApiError(
      400,
      "Material Classification must be a non-empty array."
    );
  }

  try {
    const documents = materialClassification.map((classification) => ({
      materialClassification: classification,
    }));
    await materialClassificationModel.insertMany(documents, { ordered: false });
    return res
      .status(200)
      .json(new ApiResponse(200, "Add Scrap successfully."));
  } catch (error) {
    throw new ApiError(400, "Failed during add material Scrap");
  }
});

const createCatalogue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const auction = await auctionModel.findById(id);
  if (!auction) {
    throw new ApiError(404, "Auction not found.");
  }
  // if previuos created catalogue are delete
  await catalogueModel.findOneAndDelete({ auction: id });

  const cataloguePDF = await uploadOnCloudinary(req.file.path);
  const catalogue = await catalogueModel.create({
    fileName: req.file.originalname,
    fileSize: req.file.size,
    url: cataloguePDF.url,
    auction: id,
  });

  const auctionDetails = await auctionModel.findByIdAndUpdate(id, {
    $set: {
      catalogue: catalogue._id,
    },
  });
  return res.status(200).json(new ApiResponse(200, auctionDetails));
});

const createSubscription = asyncHandler(async (req, res) => {
  const {
    afterDiscountPrice,
    numberOfYears,
    price,
    savingsPercentage,
    recommended,
    features,
    name,
  } = req.body;
  const requiredFields = [
    "afterDiscountPrice",
    "numberOfYears",
    "price",
    "savingsPercentage",
    "features",
    "name",
  ];

  const missingFields = checkMissingFields(req.body, requiredFields);

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `The following fields are missing or empty: ${missingFields.join(", ")}`
    );
  }

  const existPlan = await subscriptionmodels.findOne({ name: name });
  if (existPlan) {
    throw new ApiError(400, "plan is already exist.");
  }
  try {
    const subscription = await subscriptionmodels.create({
      afterDiscountPrice,
      numberOfYears,
      price,
      savingsPercentage,
      recommended,
      features,
      name,
    });
    return res.status(200).json(200, ApiResponse(200, subscription));
  } catch (error) {
    throw new ApiError(400, "failed to create subscription.");
  }
});

module.exports = {
  createAuction,
  createOffer,
  addMaterialClassification,
  createCatalogue,
  createSubscription,
};
