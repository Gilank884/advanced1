const jsonwebtoken = require("jsonwebtoken");
const config = require("../config/config");
const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization.slice(7);

    if (!token) {
      throw new Error("Auth failed");
    }
    console.log(token);
    const payload = jsonwebtoken.verify(token, config.jwtKey);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(500).json({
      message: "Auth failed",
    });
  }
};

module.exports = authenticate;
