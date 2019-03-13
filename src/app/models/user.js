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
    lowercase: true // Forçando os caracteres virem em caixa baixa
  },
  password: {
    type: String,
    required: true,
    select: false // Faz com que os dados de password não venham nas consultas dessa coleção
  },
  passwordResetToken: {
    // Guardará o token para resetar a senha
    type: String,
    select: false
  },
  passwordResetExpires: {
    // Guarda a data de expiração do token
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Método pre() é executado antes de (em nosso caso, save)
 */
UserSchema.pre("save", async function(next) {
  // encripta a senha
  const hash = await bcrypt.hash(this.password, 10); // 10 é o número de rounds (vezes) que esse hash deve ser gerado, para ser mais forte

  // this aqui se refere ao objeto que está sendo salvo
  this.password = hash;
  next();
});

/**
 * Método post() é executado depois de (em nosso caso, save)
 */
UserSchema.post("save", async function(next) {
  this.password = undefined;
});

// Definindo o model, informando o nome do model (User) e o seu schema (UserSchema)
const User = mongoose.model("User", UserSchema);

module.exports = User;
