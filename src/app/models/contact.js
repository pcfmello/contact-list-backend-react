const mongoose = require("../../database");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  cpf: {
    type: String,
    require: true
  },
  phoneNumbers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhoneNumber"
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
