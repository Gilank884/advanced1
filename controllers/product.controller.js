const { Product } = require("../models");
const getProducts = async (req, res, next) => {
  let { page, size, order } = req.query;

  const orders = [];
  if (order && ["ASC", "DESC"].includes(order)) {
    orders.push(["price", order]);
  }

  if (!page) {
    page = 1;
  }

  if (!size) {
    size = 5;
  }

  const offset = (parseInt(page) - 1) * parseInt(size);
  const limit = parseInt(size);

  const products = await Product.findAll({
    limit,
    offset,
    order: orders,
  });
  return res.status(200).json({
    message: "berhasil",
    data: products,
    pagination: {
      page,
      size,
    },
  });
};

module.exports = {
  getProducts,
};
