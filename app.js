const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

const routes = require("./routes");

app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: "*" }));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.listen(3001, () => {
  console.clear();
  console.debug("[] Server is starting on http://localhost:3001");
});
