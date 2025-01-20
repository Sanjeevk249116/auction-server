const { auctionModel } = require("../../models/auction");
const { ApiError } = require("../../utils/apiError");
const { addDateAndTime } = require("../../helper");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const createAuction = asyncHandler(async (req, res) => {
  const {
    EMDSchedule,
    inspectionSchedule,
    auctionSchedule,
    location,
    auctionType,
    auctionCoordinators,
    contractValidity,
    bidValidity,
    auctionRegion,
    auctionMode,
    description,
  } = req.body;
  const { id } = req.params;

  const auctionDateAndTime = {
    startDate: auctionSchedule.startDate,
    startingTime: addDateAndTime(
      auctionSchedule.startDate,
      auctionSchedule.startingTime
    ),
    endingTime: addDateAndTime(
      auctionSchedule.startDate,
      auctionSchedule.endingTime
    ),
  };

  const inspectionDetails = {
    inspectionLocation: inspectionSchedule.inspectionLocation,
    endDate: inspectionSchedule.endDate,
    startingTime: addDateAndTime(
      inspectionSchedule.startDate,
      inspectionSchedule.startingTime
    ),
    endingTime: addDateAndTime(
      inspectionSchedule.startDate,
      inspectionSchedule.endingTime
    ),
  };
  const emdDetails = {
    lastDate: EMDSchedule.lastDate,
    lastTime: addDateAndTime(EMDSchedule.lastDate, EMDSchedule.lastTime),
  };

  const auctionDetails = await new auctionModel({
    EMDSchedule: emdDetails,
    inspectionSchedule: inspectionDetails,
    auctionSchedule: auctionDateAndTime,
    location,
    auctionType,
    auctionCoordinators,
    contractValidity,
    bidValidity,
    auctionRegion,
    auctionMode,
    description,
    sellerId: id,
  });

  console.log("Before save - auctionId:", auctionDetails.auctionId);
  console.log("Before save - isNew:", auctionDetails.isNew);
  
  const savedAuction = await auctionDetails.save();
  
  console.log("After save - auctionId:", savedAuction.auctionId);
  


  return res
    .status(200)
    .json(new ApiResponse(200, "auction created successfully."));
});

module.exports = { createAuction };
