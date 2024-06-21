//Client's details:-
const mongoose = require("mongoose");
const clientDetail = new mongoose.Schema({
    senders_name:{
      type:String,
      required:true
    },
    senders_email:{
      type:String,
      required:true
    },
    receivers_name:{
      type:String,
      required:true
    },
    receivers_email:{
      type:String,
      required:true
    },
    created_at:{
      type:Date,
      default:new Date()
    }
  });

  module.exports = mongoose.model("ClientDetail", clientDetail);