const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { ApiError } = require("./utils/apiError");
const { buyerRouters } = require("./routes/buyerRouter");
const { adminRouter } = require("./routes/adminRouter");
const { commanRouter } = require("./routes/commanRouter");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/", adminRouter);
app.use("/", buyerRouters);
app.use("/", commanRouter);

app.use((req, res) => {
 const apiError = new ApiError(400, "The requested url is not found.");
});
module.exports = { app };
