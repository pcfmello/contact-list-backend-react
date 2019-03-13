const mongoose = require("../../database");

const PhoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    require: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
    require: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  },  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PhoneNumber = mongoose.model("PhoneNumber", PhoneNumberSchema);

module.exports = PhoneNumber;
