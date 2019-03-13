const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars"); // Uma engine que preenche variáveis em arquivos HTML

const { host, port, user, pass } = require("../config/mail.json");

// Configuração do Mailtrap
const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

transport.use(
  "compile",
  hbs({
    viewEngine: "handlebars",
    viewPath: path.resolve("./src/resources/mail/"),
    extName: ".html"
  })
);

module.exports = transport;
