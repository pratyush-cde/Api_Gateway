const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const app = express();

const PORT = 3005;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 5,
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isAuthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      },
    );

    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
});

app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://localhost:3002/",
    changeOrigin: true,
  }),
);

app.get("/home", (req, res) => {
  return res.json({ message: "Ok" });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
