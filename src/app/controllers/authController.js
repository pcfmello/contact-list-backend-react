const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Gerador de token que vem junto com o node
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth.json");
const User = require("../models/user.js"); // Model User

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign({ params }, authConfig.secret, {
    expiresIn: 86400 // Um dia
  });
}

/**
 * POST: /auth/register
 *
 * */
router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).send({ Error: "User is already exists" });

    const user = await User.create(req.body);

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res
      .status(400)
      .send({ Error: "Registration failed", stack: err.stack });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password"); // +password indica para o campo password vir preenchido, pois está false no schema

  if (!user) return res.status(400).send({ Error: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ Error: "Invalid password" });

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ Error: "User not found" });

    // Gerando o token | aleatório de 20 caracteres | em hexadecimal
    const token = crypto.randomBytes(20).toString("hex");

    // Configurando o tempo de expiração do token
    const now = new Date();
    now.setHours(now.getHours() + 1); // Setando 1 hora para expiração

    // Setando os campos do usuário
    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });

    mailer.sendMail(
      {
        to: email,
        from: "paulo@gmail.com",
        template: "auth/forgot_password", // template html
        context: { token } // Repassando a variável para o template
      },
      err => {
        if (err)
          return res.status(400).send({ Error: "Cannot send forgot password" });
      }
    );

    return res.send();
  } catch (error) {
    res.status(400).send({
      Error: "Error on forgot password. Try again!",
      Err: error.stack
    });
  }
});

/**
 * Usando o app repassado através do require do index
 * e será acessada através de /auth
 * */
module.exports = app => app.use("/auth", router);
