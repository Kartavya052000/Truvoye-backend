const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  verified: {
    type: Boolean,
    default: false, // Default value is false
  },
  address: {
    type: Object,
    required: [true, "Your address is required"],
  },
  phone: {
    type: String,
    required: [true, "Your phone number is required"],
  },
  truckLicensePlateNumber: {
    type: String,
    required: [true, "Your Truck's License Plate Number is required"],
  },
  driverLicense: {
    type: String,
    required: [true, "Your phone Driver's License Number is required"],
  },
  isActive:{
    type: Boolean,
    default: true
  },
  isAssigned: Boolean,
  token: String, // Field to store the reset token
  resetPasswordExpires: Date, // Field to store the token expiration time
});


driverSchema.pre("save", async function (next) {
    // Hash the password only if it has been modified (or is new)
    if (!this.isModified("password")) {
      return next();
    }
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  });

  module.exports = mongoose.model("Driver", driverSchema);