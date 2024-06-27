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
    enum: [0, 1, 2],
    required: true 
  }
  // created_by:{
  //   type:mongoose.Schema.Types.ObjectId
  // }
});

module.exports = mongoose.model("OrderDetails", orderDetail);
