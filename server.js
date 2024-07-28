//Main server file: Initializes the Express application, connects to MongoDB, and sets up the routes.

const express = require("express");  
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const authRoute = require("./Routes/AuthRoute");
const bodyParser = require('body-parser');
const orderRoute = require('./Routes/OrdersRoute');
const submitOrder = require('./Routes/OrdersRoute');
const driverRoute = require('./Routes/DriverRoute');
const path = require('path');
const fileRoutes = require('./Routes/FileRoute');

const {MONGO_URL,PORT} = process.env;
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    cors({
      origin: ["https://truvoye.com","https://www.truvoye.com","https://truvoye.vercel.app", "http://localhost:3000"], // Add allowed origins
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));
  
app.get('/api/test',(req,res)=>{
    res.send("Hello World! v2");
})

app.use("/api/auth", authRoute);

app.use("/api/orderDetails", orderRoute);
app.use("/api/order", orderRoute);

app.use("/api/SubmitOrder", submitOrder);



app.use("/api/driver", driverRoute);

//Route for downloading project-proposal
// app.use('/api', fileRoutes);

// Endpoint to download PDF
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  // console.log(filename)
  const filePath = path.join(__dirname, 'Uploads', filename);
  res.download(filePath, (err) => {
      if (err) {
          res.status(404).send('File not found');
      }
  });
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });