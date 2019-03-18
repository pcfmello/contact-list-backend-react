const bcrypt = require("bcryptjs");

const mongoose = require("../../database");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", async function hashPassword(next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.post("save", async function(next) {
  this.password = undefined;
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
