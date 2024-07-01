const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const pickupRequestSchema = new mongoose.Schema({
  order_id: {
    type: ObjectId,
    ref: "OrderDetails",
    required: true,
  },
  client_id: {
    type: ObjectId,
    ref: "ClientDetail",
    required: true,
  },
  driver_id: {
    type: ObjectId,
    ref: "Driver",
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  requestStatus:{
    type: Number,
    enum: [0, 1, 2],  // 0- pending decision, 1- accepted, 2 - rejected 
    required: true 
  }
});

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);
