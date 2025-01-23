const mongoose = require("mongoose");
const { generateId } = require("../config/authDetails");

const auctionSchema = new mongoose.Schema(
  {
    EMDSchedule: {
      lastDate: {
        type: Date,
        required: [true, "EMD Last date is required"],
      },
      lastTime: {
        type: Date,
        required: [true, "EMD Last time is required"],
      },
    },
    auctionId: {
      type: String,
      required: [true, "Auction ID is required"],
      default: function () {
        // Add a default function
        return generateId(`A${this.auctionType}`);
      },
    },
    inspectionSchedule: {
      endDate: {
        type: Date,
        required: [true, "Inspection end date is required"],
      },
      inspectionLocation: {
        type: String,
        required: [true, "Inspection location is required"],
        minlength: [
          3,
          "Inspection location must be at least 3 characters long",
        ],
      },
      startingTime: {
        type: Date,
        required: [true, "Inspection starting time is required"],
      },
      endingTime: {
        type: Date,
        required: [true, "Inspection ending time is required"],
      },
    },
    auctionSchedule: {
      startDate: {
        type: Date,
        required: [true, "Auction start date is required"],
      },
      startingTime: {
        type: Date,
        required: [true, "Auction starting time is required"],
      },
      endingTime: {
        type: Date,
        required: [true, "Auction ending time is required"],
      },
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      zipCode: {
        type: String,
      },
    },
    auctionType: {
      type: String,
      enum: {
        values: ["forwardAuction", "reverseAuction"],
        message:
          'Auction type must be either "forwardAuction" or "reverseAuction"',
      },
      required: [true, "Auction type is required"],
      default: "forwardAuction",
    },
    auctionCoordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "coordinatorModel",
        required: [true, "At least one auction coordinator is required"],
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizationModel",
    },
    offers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "offerModel",
      },
    ],
    contractValidity: {
      type: Number,
      required: [true, "Contract validity is required"],
    },
    bidValidity: {
      type: Number,
      required: [true, "Bid validity is required"],
    },
    auctionRegion: {
      type: String,
      enum: {
        values: [
          "East India",
          "North India",
          "South India",
          "West India",
          "Central India",
        ],
        message:
          "Auction region must be one of: East India, North India, South India, West India, Central India",
      },
      default: "North India",
    },
    auctionMode: {
      type: String,
      enum: {
        values: ["open auction", "closed auction"],
        message:
          'Auction mode must be either "open auction" or "closed auction"',
      },
      default: "open auction",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
    },
    catalogue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "catalogueModel",
    },
    status: {
      type: String,
      enum: ["live", "today", "upcomming", "completed"],
      default: "upcomming",
    },
  },
  { timestamps: true }
);

auctionSchema.pre("save", async function (next) {
  try {
    if (this.isNew || !this.auctionId) {
      this.auctionId = generateId(`A${this.auctionType}`);
    }
    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
  }
});

const auctionModel = mongoose.model("auctionModel", auctionSchema);

module.exports = { auctionModel };
