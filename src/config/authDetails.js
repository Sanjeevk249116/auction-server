const axios = require("axios");
const { ApiError } = require("../utils/apiError");
require("dotenv").config();

const getUserFromAuthService = async (userId) => {
  console.log(userId)
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/profile/${userId}`
    );
    return response?.data;
  } catch (error) {
    throw new ApiError(400, "Unable to fetch user data");
  }
};

const generateId = (orgName) => {
  const orgPrefix = orgName.slice(0, 3).toUpperCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const organizationId = `${orgPrefix}${randomDigits}`;

  return organizationId;
};

const addNewSeller = async (sellerObj) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/user/register-newSeller`,
      sellerObj
    );
    return response?.data?.data;
  } catch (error) {
    await deleteFailedInvite(sellerObj.email);
    throw new ApiError(400, "unable to invite new seller.");
  }
};

const deleteFailedInvite = async (email) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/user/delete-newSeller/${email}`
    );
    return response?.data?.data;
  } catch (error) {
    throw new ApiError(400, "unable to delete data.");
  }
};

module.exports = {
  getUserFromAuthService,
  generateId,
  addNewSeller,
  deleteFailedInvite,
};
