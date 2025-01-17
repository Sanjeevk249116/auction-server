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

module.exports = { getUserFromAuthService };
