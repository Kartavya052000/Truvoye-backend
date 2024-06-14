const express = require("express");  
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const {MONGO_URL,PORT } = process.env;

app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));
  
app.get('/api/test',(req,res)=>{
    res.send("working");
})
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });