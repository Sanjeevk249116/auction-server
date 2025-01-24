const { documentUploadModel } = require("../../models/document");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { uploadOnCloudinary } = require("../../utils/cloudinary");

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



module.exports = { uploadFiles };
