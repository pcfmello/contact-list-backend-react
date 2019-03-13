const fs = require("fs");
const path = require("path");

module.exports = app => {
  fs.readdirSync(__dirname) // Ler um diretório (o atual)
    .filter(file => file.indexOf(".") !== 0 && file !== "index.js") // Filtrando os arquivos (não comece com 0 nem tenha nome de index.js)
    .forEach(file => require(path.resolve(__dirname, file))(app)); // Faz um require em cada um repassando o app
};
