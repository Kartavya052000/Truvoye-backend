const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoute = require("./Routes/AuthRoute");
const orderRoute = require("./Routes/OrdersRoute");
const driverRoute = require("./Routes/DriverRoute");
const contactRoute = require("./Routes/ContactRoute");
const fileRoutes = require("./Routes/FileRoute");

const app = express();
const { MONGO_URL, PORT } = process.env;


// -------------------------------
// 1. ENABLE CORS FIRST (VERY IMPORTANT)
// -------------------------------
app.use(
  cors({
    origin: [
      "https://truvoye.com",
      "https://www.truvoye.com",
      "https://truvoye.vercel.app",
      "http://localhost:3000",
      "https://truvoye-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());


// -------------------------------
// 2. BODY PARSERS AFTER CORS
// -------------------------------
app.use(express.json());
app.use(bodyParser.json());


// -------------------------------
// 3. CONNECT TO MONGO
// -------------------------------
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error(err));


// -------------------------------
// 4. ROUTES
// -------------------------------
app.get('/api/test', (req, res) => {
  res.send("Hello World! v2");
});

app.use("/api/auth", authRoute);
app.use("/api/orderDetails", orderRoute);
app.use("/api/order", orderRoute);
app.use("/api/SubmitOrder", orderRoute);
app.use("/api/driver", driverRoute);
app.use("/api/contacts", contactRoute);
app.use('/api', fileRoutes);


// -------------------------------
// 5. START SERVER
// -------------------------------
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
