const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//Order details:-
const orderDetail = new mongoose.Schema({
  client_id:{
    type:ObjectId
  },
  pickup_date:{
    type:Date
  },
    pickup_address: {
      type: Object,
      required:true
    },
    receiver_address: {
      type: Object,
      required:true
    },
    weight: {
        type: Number,
      },
      created_at:{
        type:Date,
        default:new Date()
      },
      // created_by:{
      //   type:mongoose.Schema.Types.ObjectId
      // }
  });

  
  
module.exports = mongoose.model("OrderDetails", orderDetail);