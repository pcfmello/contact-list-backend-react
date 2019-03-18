const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authConfig = require("../../config/auth.json");
const User = require("../models/user.js");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign({ params }, authConfig.secret, {
    expiresIn: 86400
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).send({ errorMessage: "User is already exists" });

    const user = await User.create(req.body);

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res
      .status(400)
      .send({ errorMessage: "Registration failed", stack: err.stack });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ errorMessage: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ errorMessage: "Invalid password" });

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });
});

module.exports = app => app.use("/auth", router);
