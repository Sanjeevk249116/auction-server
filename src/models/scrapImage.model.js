const mongoose = require("mongoose");

// Define the Scrap Image Schema
const scrapImageSchema = new mongoose.Schema(
  {
    photo1: {
      type: String,
      required: false, 
    },
    photo2: {
      type: String,
      required: false,
    },
    photo3: {
      type: String,
      required: false, 
    },
    photo4: {
      type: String,
      required: false, 
    },
    photo5: {
      type: String,
      required: false, 
    },
  },
  { timestamps: true } 
);


const scrapImageModels = mongoose.model("scrapImageModels", scrapImageSchema);


module.exports = {scrapImageModels};
