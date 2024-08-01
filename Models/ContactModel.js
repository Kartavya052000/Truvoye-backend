//Client's details:-
const mongoose = require("mongoose");
const ContactDetail = new mongoose.Schema({
    contact_fullname:{
      type:String,
      required:true
    },
    contact_email:{
      type:String,
      required:true
    },
    contact_message:{
      type:String,
      required:true
    },
    created_at:{
      type:Date,
      default:new Date()
    }
  });

  module.exports = mongoose.model("ContactDetail", ContactDetail);