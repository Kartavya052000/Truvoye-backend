const express = require("express");  
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const authRoute = require("./Routes/AuthRoute");
const bodyParser = require('body-parser');

const {MONGO_URL,PORT } = process.env;
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(
    cors({
      origin: "*",
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

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });