const { coordinatorModel } = require("../../models/coordinator");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const deleteCoordinator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await coordinatorModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json(new ApiResponse(200, "coordinator delete successfully."));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Failed to delete coordinator.");
  }
});

module.exports = { deleteCoordinator };
