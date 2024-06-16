// const express = require("express");  
// const mongoose = require("mongoose");
// const cors = require("cors");
// const app = express();
// require("dotenv").config();
// const {MONGO_URL,PORT } = process.env;

// app.use(
//     cors({
//       origin: ["http://localhost:3000"],
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       credentials: true,
//     })
//   );
// mongoose
//   .connect(MONGO_URL)
//   .then(() => console.log("MongoDB is  connected successfully"))
//   .catch((err) => console.error(err));
  
// app.get('/OrderProposal',(req,res)=>{
//     res.send("working");
// });

// // app.use('/api',OrderProposal);

// app.post('http://localhost:3000/OrderProposal',(req,res)=>{

//   const pickupAdress = req.body.pickupAdress;
//   const receiverAddress = req.body.receiverAddress;
//   const weight = req.body.weight

//   console.log(pickupAdress,receiverAddress,weight);
  
//   res.send("Order Proposal working");
// });

// app.listen(PORT, () => {
//     console.log(`Server is listening on port ${PORT}`);
//   });


//chatgpt's code:- 

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