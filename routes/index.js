const router = require("express").Router();
const routes = [require("./auth.routes"), require("./product.routes")];

for (const route of routes) {
  router.use("/api", route);
}

module.exports = router;
