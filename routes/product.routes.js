const router = require("express").Router();
const { ProductsController } = require("../controllers");
const { Middleware } = require("../middleware");

router.get("/products", Middleware.authenticate, ProductsController.getProducts);

module.exports = router;
