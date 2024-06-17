const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const { MONGO_URL, PORT } = process.env;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

// Test route
app.get('/OrderProposal', (req, res) => {
  res.send("working");
});

// POST route for order proposal
app.post('/OrderProposal', (req, res) => {
  const { pickup_address, receivers_address, weight } = req.body;

  console.log(pickup_address, receivers_address, weight);

  res.send("Order Proposal working");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});