const { documentUploadModel } = require("../models/document");
const { materialClassificationModel } = require("../models/MaterialScrap");
const { organizationModel } = require("../models/organization.models");
const { profileModel } = require("../models/profile.models");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const userProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    throw new Error(401, "Unautherized User.");
  }
  const user = await profileModel
    .findById(userId)
    .select("-password -auctionToken");
  if (!user) {
    throw new ApiError(400, "User doest not exist.");
  }

  return res.status(200).json(new ApiResponse(200, user));
});

const craeteOrganization = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { location, organizationName, GSTIN } = req.body;

    if (!location || !organizationName || !GSTIN) {
      throw new ApiError(400, "All fields are required.");
    }

    const organization = await organizationModel.findOneAndUpdate(
      { GSTIN },
      {
        location,
        organizationName,
        GSTIN,
        owner: userId,
        organizationId: generateId(organizationName),
      }, // Update or create these fields
      {
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
        setDefaultsOnInsert: true, // Apply default values if creating
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          organization.isNew
            ? "Organization created successfully."
            : "Organization updated successfully."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server error while creating/updating organization."
    );
  }
});

const userOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationModel.findOne({ owner: req.userId });
  return res.status(200).json(new ApiResponse(200, organization));
});

const uploadDocumentInOrganization = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const pcbDocument = req.files?.PCB?.[0]?.path;
  const goodAndServiceDocument =
    req.files?.["Goods-And-Services-Tax"]?.[0]?.path;
  const panDocument = req.files?.["PAN-Card"]?.[0]?.path;
  const gstDocument = req.files?.GST?.[0]?.path;
  const kycDocument = req.files?.KYC?.[0]?.path;

  // Validate if all required documents are provided
  if (
    !(
      pcbDocument &&
      goodAndServiceDocument &&
      panDocument &&
      gstDocument &&
      kycDocument
    )
  ) {
    throw new ApiError(400, "All documents are required.");
  }
  try {
    const PCB = await uploadOnCloudinary(pcbDocument);
    const GST = await uploadOnCloudinary(gstDocument);
    const GoodsAndServicesTax = await uploadOnCloudinary(
      goodAndServiceDocument
    );
    const PANCard = await uploadOnCloudinary(panDocument);
    const KYC = await uploadOnCloudinary(kycDocument);

    await documentUploadModel.findOneAndUpdate(
      { profile: userId },
      {
        PCB: PCB?.url,
        GST: GST?.url,
        GoodsAndServicesTax: GoodsAndServicesTax?.url,
        PANCard: PANCard?.url,
        KYC: KYC?.url,
        profile: userId,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
        setDefaultsOnInsert: true, // Apply default values if creating
      }
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "failed to upload files");
  }
  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, "Documents uploaded successfully."));
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

const allScrapList = asyncHandler(async (req, res) => {
  const scrapList = await materialClassificationModel.find();
  return res.status(200).json(new ApiResponse(200, scrapList));
});

const selectScrapMaterial = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { classifications } = req.body;
    if (!Array.isArray(classifications) || classifications.length === 0) {
      throw new ApiError(
        400,
        "Material Classification must be a non-empty array."
      );
    }
    await organizationModel.findOneAndUpdate(
      { owner: userId },
      {
        $set: {
          materialClassification: classifications,
          organizationSetUp: true,
        },
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "select scrap successfully."));
  } catch (error) {
    throw new Error(400, "failed to upload selected scrap");
  }
});

module.exports = {
  userProfile,
  userOrganization,
  craeteOrganization,
  uploadDocumentInOrganization,
  allScrapList,
  addMaterialClassification,
  selectScrapMaterial,
};
