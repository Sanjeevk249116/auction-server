const { default: mongoose } = require("mongoose");
const { generateId, addNewSeller } = require("../config/authDetails");
const { documentUploadModel } = require("../models/document");
const { materialClassificationModel } = require("../models/MaterialScrap");
const { organizationModel } = require("../models/organization.models");
const { profileModel } = require("../models/profile.models");
const { walletModel } = require("../models/wallet.model");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { checkMissingFields } = require("../utils/checkFields");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { sendMailToUser } = require("../utils/sendEmail");
require("dotenv").config();

const userProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(401, "Unautherized User.");
  }
  const user = await profileModel
    .findById(userId)
    .select("-password -auctionToken");
  if (!user) {
    throw new ApiError(400, "User doest not exist.");
  }

  return res.status(200).json(new ApiResponse(200, user));
});

const enterGstNumber = asyncHandler(async (req, res) => {
  const { GSTIN } = req.params;
  const gstNumber = await organizationModel.findOne({ GSTIN });
  if (gstNumber) {
    throw new ApiError(400, "Gst number is already register.");
  }
  const gst = await organizationModel.create({
    GSTIN,
  });
  return res.status(200).json(new ApiResponse(200, gst));
});

const craeteOrganization = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { location, organizationName, GSTIN, panCard } = req.body;

  const requiredFields = ["organizationName", "location", "GSTIN", "panCard"];
  const missingFields = checkMissingFields(req.body, requiredFields);

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `The following fields are missing or empty: ${missingFields.join(", ")}`
    );
  }

  const organization = await organizationModel.findOneAndUpdate(
    { GSTIN },
    {
      location,
      organizationName,
      GSTIN,
      panCard,
      owner: userId,
      organizationId: generateId(organizationName),
    }, // Update or create these fields
    {
      new: true, // Return the updated document
      upsert: true, // Create the document if it doesn't exist
      setDefaultsOnInsert: true, // Apply default values if creating
    }
  );

  await walletModel.findOneAndUpdate(
    {
      profile: userId,
    },
    {
      profile: userId,
    },
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
});

const userOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationModel.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.userId) } },
    {
      $lookup: {
        from: "profilemodels",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { auctionToken: 0 } }],
      },
    },
    {
      $unwind: "$owner",
    },
  ]);
  return res.status(200).json(new ApiResponse(200, organization[0]));
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
  const organization = await organizationModel.findOne({ owner: userId });
  if (!organization) {
    throw new ApiError(400, "organization doex not exist.");
  }
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
        organization: organization?._id,
        fileSize: PCB.bytes,
      },
      {
        fileType: "GST",
        fileName: "gst",
        url: GST.url,
        organization: organization?._id,
        fileSize: GST.bytes,
      },
      {
        fileType: "Good and Service tax",
        fileName: "goodsAndServicesTax",
        url: GoodsAndServicesTax.url,
        organization: organization?._id,
        fileSize: GoodsAndServicesTax.bytes,
      },
      {
        fileType: "PAN card",
        fileName: "pan",
        url: PANCard.url,
        organization: organization?._id,
        fileSize: PANCard.bytes,
      },
      {
        fileType: "KYC",
        fileName: "kyc",
        url: KYC.url,
        organization: organization?._id,
        fileSize: KYC.bytes,
      },
    ];

    await documentUploadModel.deleteMany({ organization: organization?._id });

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

  await profileModel.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        accountSetUp: true,
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "select scrap successfully."));
});

const verifyAccountAndOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const organization = await organizationModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        accountVerify: "verified",
      },
    },
    {
      new: true,
    }
  );

  const profile = await profileModel.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        verifiedUser: "verified",
      },
    },
    {
      new: true,
    }
  );

  if (!organization) {
    throw new ApiError(400, "organization does not found.");
  }

  if (!profile) {
    throw new ApiError(400, "profile does not found.");
  }

  return res.status(200).json(new ApiResponse(200, organization));
});

const blockrdAccountAndOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const organization = await organizationModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        accountVerify: "blocked",
      },
    },
    {
      new: true,
    }
  );

  const profile = await profileModel.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        verifiedUser: "blocked",
      },
    },
    {
      new: true,
    }
  );

  if (!organization) {
    throw new ApiError(400, "organization does not found.");
  }

  if (!profile) {
    throw new ApiError(400, "profile does not found.");
  }

  return res.status(200).json(new ApiResponse(200, organization));
});

const iniviteNewSeller = asyncHandler(async (req, res) => {
  const {
    organizationName,
    location,
    GSTIN,
    email,
    name,
    phoneNumber,
    panCard,
  } = req.body;
  const requiredFields = [
    "organizationName",
    "location",
    "GSTIN",
    "email",
    "name",
    "phoneNumber",
    "panCard",
  ];
  const missingFields = checkMissingFields(req.body, requiredFields);

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `The following fields are missing or empty: ${missingFields.join(", ")}`
    );
  }
  const profileExist = await profileModel.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (profileExist) {
    throw new ApiError(400, "Seller account is already created.");
  }
  
  await addNewSeller({
    name,
    email,
    phoneNumber,
    password: "MyPassword@123",
  });

  const profile = await profileModel.create({
    email: email,
    userName: name,
    phoneNumber: phoneNumber,
    accountType: "seller",
    accountSetUp: true,
    verifiedUser: "verified",
  });

  const organization = await organizationModel.create({
    GSTIN,
    accountType: "seller",
    accountVerify: "verified",
    location,
    organizationId: generateId(organizationName),
    organizationName,
    organizationSetUp: true,
    owner: profile?._id,
    panCard: panCard,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome!",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 
          auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="text-align: center; color: #4CAF50;">Welcome to Our Platform!</h2>
      <p>Hello,</p>
      <p>Thank you for signing up with us. Below are your login credentials:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email ID:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Password:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color: 
              red;">MyPassword@123</strong></td>
        </tr>
      </table>
      <p>Please change your password after logging in for security reasons.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best Regards,<br><strong> Sanjeev Kushwaha</strong></p>
    </div>
  `,
  };

  await sendMailToUser(mailOptions);
  return res.status(200).json(new ApiResponse(200, organization));
});

const updateOrganization = asyncHandler(async (req, res) => {
  const userId = req.userId;
});

module.exports = {
  userProfile,
  userOrganization,
  craeteOrganization,
  uploadDocumentInOrganization,
  allScrapList,
  selectScrapMaterial,
  verifyAccountAndOrganization,
  blockrdAccountAndOrganization,
  iniviteNewSeller,
  enterGstNumber,
  updateOrganization,
};
