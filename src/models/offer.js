const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    EMDAmount: {
      type: String,
      required: [true, "Emd amount is required"],
    },

    scrapDetails: {
      type: {
        type: String,
        required: [true, "Scrap type is required"],
      },
      quantity: {
        type: String,
        required: [true, "quantity is required"],
      },
      unit: {
        type: String,
        enum: ["MT", "KG", "prices", "lot"],
      },
    },
    offerSchedule: {
      startingTime: {
        type: Date,
        required: [true, "time is required"],
      },
      endingTime: {
        type: Date,
        required: [true, "Time is required"],
      },
    },
    startingPrice: {
      type: String,
    },
    minimumBid: {
      type: String,
    },
    maximumBid: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    requiresPCBCertificate: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    liftingPeriod: {
      type: String,
      required: [true, "lifting Period is required"],
    },
    ItTCSTaxes: {
      type: String,
      required: [true, "Taxs is required"],
    },
    GSTTaxes: {
      type: String,
      required: [true, "Gst is required"],
    },
    offerImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "scrapImageModels",
    },
    offerNumber: {
      type: Number,
      required: [true, "Offer Number is required"],
      default: 0,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auctionModel",
    },
    status: {
      type: Boolean,
      default: false,
    },
    depositedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "emdModel",
      },
    ],
    deposited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

offerSchema.pre("validate", async function (next) {
  try {
    if (this.isNew) {
      const highestOffer = await this.constructor
        .findOne({ auctionId: this.auctionId })
        .sort({ offerNumber: -1 });
      this.offerNumber = highestOffer ? highestOffer.offerNumber + 1 : 1;
    }
    next();
  } catch (error) {
    console.error("Error in pre-validate middleware:", error);
    next(error);
  }
});

const offersModel = mongoose.model("offersModel", offerSchema);
module.exports = { offersModel };
