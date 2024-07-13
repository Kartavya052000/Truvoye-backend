const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//Order details:-
const orderDetail = new mongoose.Schema({
  client_id: {
    type: ObjectId,
    ref: 'ClientDetail',
    required: true,
  },
  driver_id: {
    type: ObjectId,
    ref: 'Driver', // Reference to the Driver model
  },
  pickup_date: {
    type: Date,
  },
  pickup_address: { 
    type: Object,
    required: true,
  },
  receiver_address: {
    type: Object,
    required: true,
  },
  weight: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  order_status:{
    type: Number,
    enum: [0, 1, 2, 3],    // 0 - unassigned, 1- assigned, 2- progress, 3- completed
    required: true 
  },
  otp:{
    type: Number
  },
  completed_on:{
    type: Date
  },
  driver_info:{
    type: Object
  },
  client_info:{
    type: Object
  },
  cost: {
    type: Number,
  },
  distance: {
    type: String,
  },
  duration:{
    type: String,
  }
  // created_by:{
  //   type:mongoose.Schema.Types.ObjectId
  // }
});

module.exports = mongoose.model("OrderDetails", orderDetail);
