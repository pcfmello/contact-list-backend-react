const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

module.exports = (req, res, next) => {
  // Middlewares são executados antes da controler, uma espécie de interceptor
  // next() serve para passar para o próximo passo
  const authHeader = req.headers.authorization;

  // Verifica se o token veio no cabeçalho da requisição
  if (!authHeader) return res.status(401).send({ Error: "No token provider" });

  // Divide o token e verifica se o mesmo foi dividido em duas partes, senão, lança um erro
  const parts = authHeader.split(" ");
  if (!parts.length === 2)
    return res.status(401).send({ Error: "Token error" });

  // Cria as constantes, uma com cada parte do array
  const [scheme, token] = parts;

  // Verifica o padrão da primeira parte do token
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ Error: "Token malformatted" });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    // decoded é o id do usuário caso o token esteja correto
    if (err) return res.status(401).send({ Error: "Token invalid" });

    // Repassando o id para ser utilizado em qualquer função do controller que esteja autenticado.
    req.userId = decoded.params.id;

    // Passando para o proximo middleware/controller
    return next();
  });
};
