const mongoose = require("mongoose");

const coordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  languages: [
    {
      type: String,
    },
  ],
  email: {
    type: String,
    unique: true,
  },
  address: {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  position: {
    type: String,
  },
},{timestamps:true});

const coordinatorModel = mongoose.model("coordinatorModel", coordinatorSchema);
module.exports = { coordinatorModel };
