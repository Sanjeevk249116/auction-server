const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPathOfFile) => {
  try {
    if (!localPathOfFile) return null;
    const uploadResult = await cloudinary.uploader.upload(localPathOfFile, {
      resource_type: "auto",
    });
    fs.unlinkSync(localPathOfFile);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localPathOfFile);
  }
};

module.exports = { uploadOnCloudinary };