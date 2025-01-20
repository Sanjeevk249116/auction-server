const axios = require("axios");
const { ApiError } = require("../utils/apiError");
require("dotenv").config();

const getUserFromAuthService = async (userId) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/user/profile/${userId}`
    );
    return response?.data?.data;
  } catch (error) {
    throw new ApiError(400, "Unable to fetch user data");
  }
};

const generateId = (orgName) => {
  console.log(orgName)
  const orgPrefix = orgName.slice(0, 3).toUpperCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const organizationId = `${orgPrefix}${randomDigits}`;

  return organizationId;
};

module.exports = { getUserFromAuthService, generateId };
