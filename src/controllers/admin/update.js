const { coordinatorModel } = require("../../models/coordinator");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

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
    console.log(req.body,id)
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


module.exports = { createCoordinator, updateCoordinator };
