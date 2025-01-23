const { generateId } = require("../config/authDetails");
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
    console.log(error);
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
  const requiredDocuments = [
    "PCB",
    "Goods-And-Services-Tax",
    "PAN-Card",
    "GST",
    "KYC",
  ];

  const missingDocuments = requiredDocuments.filter(
    (doc) => !req.files?.[doc]?.[0]?.path
  );

  if (missingDocuments.length > 0) {
    throw new ApiError(
      400,
      `Missing documents: ${missingDocuments.join(", ")}`
    );
  }

  try {
    const documentUploads = await Promise.all([
      uploadOnCloudinary(req.files.PCB[0].path),
      uploadOnCloudinary(req.files["Goods-And-Services-Tax"][0].path),
      uploadOnCloudinary(req.files["PAN-Card"][0].path),
      uploadOnCloudinary(req.files.GST[0].path),
      uploadOnCloudinary(req.files.KYC[0].path),
    ]);

    const [PCB, GoodsAndServicesTax, PANCard, GST, KYC] = documentUploads;
    const document = [
      {
        fileType: "PCB",
        fileName: "pcb",
        url: PCB.url,
        profile: userId,
        fileSize: PCB.bytes,
      },
      {
        fileType: "GST",
        fileName: "gst",
        url: GST.url,
        profile: userId,
        fileSize: GST.bytes,
      },
      {
        fileType: "Good and Service tax",
        fileName: "goodsAndServicesTax",
        url: GoodsAndServicesTax.url,
        profile: userId,
        fileSize: GoodsAndServicesTax.bytes,
      },
      {
        fileType: "PAN card",
        fileName: "pan",
        url: PANCard.url,
        profile: userId,
        fileSize: PANCard.bytes,
      },
      {
        fileType: "KYC",
        fileName: "kyc",
        url: KYC.url,
        profile: userId,
        fileSize: KYC.bytes,
      },
    ];

    await documentUploadModel.deleteMany({ profile: userId });

    const fileData = await documentUploadModel.insertMany(document);

    return res
      .status(200)
      .json(new ApiResponse(200, fileData, "Documents uploaded successfully."));
  } catch (error) {
    throw new ApiError(500, `Failed to upload documents: ${error.message}`);
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
  selectScrapMaterial,
};
