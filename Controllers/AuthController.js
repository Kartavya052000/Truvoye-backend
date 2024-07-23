const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require('../nodemailerConfig');
const { default: mongoose } = require("mongoose");
const { PRODUCTION_LINK } = process.env;

// Function for SignUp
module.exports.Signup = async (req, res, next) => {
    try {
      const { email, password, username } = req.body;
      // const { email, password, username, createdAt } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json({ message: "User already exists" });
      }
      const user = await User.create({ email, password, username});
      const token = createSecretToken(user._id);
      user.token = token;

      await user.save();

    //   res.cookie("token", token, {
    //     withCredentials: true,
    //     httpOnly: false,
    //   });
    
    // Send email with the password reset link containing the token
    // const verifyLink = `http://localhost:3000/verify-email/${token}`;
    const resetLink = `${process.env.PRODUCTION_LINK}/verify-email/${token}`;
    
    const mailOptions = {
      from: 'kartavyabhayana1@gmail.com',
      to: email,
      subject: 'Account Verification email',
      html: `Click <a href="${resetLink}">here</a> to confirm your email address.`,
    };

    await transporter.sendMail(mailOptions);
      res
        .status(201)
        .json({ message: "Email sent successfully", success: true, });

      next();
    } catch (error) {
      console.error(error);
    }
  };
  module.exports.Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.json({ message: "All fields are required" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Incorrect password or email" });
      }
      // Check if the user is verified
    if (!user.verified) {
      return res.json({ message: "User not verified" });
    }
      const auth = await bcrypt.compare(password, user.password);
      console.log(auth)
      if (!auth) {
        return res.json({ message: "Incorrect password or email" });
      }
  
      const token = createSecretToken(user._id);
      // res.cookie("token", token, {
      //   withCredentials: true,
      //   httpOnly: false,
      // });
  
      // Save the token to the user in the database
      user.token = token;
      res.status(201).json({ message: "User logged in successfully", success: true, token: token,user});
      next();
    } catch (error) {
      console.error(error);
    }
  };


  module.exports.GetAdmin = async (req, res) => {
    const { id } = req.params;
    try {
      if (mongoose.Types.ObjectId.isValid(id) && id !== "null" && id !== "undefined") {
        const user = await User.findOne({ _id: id }); // Corrected User model usage
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
      } else {
        return res.status(400).json({ message: "Invalid user ID" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  module.exports.EditAdmin = async (req, res) => {
    const { id } = req.params;
    const { email, username, password } = req.body;

    try {
        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Find user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if they are provided
        if (email) user.email = email;
        if (username) user.username = username;
        if (password) user.password = await bcrypt.hash(password, 10); // Hash the password before saving
        user.updatedAt = new Date();

        await user.save();
        
        res.status(200).json({ message: "Admin details updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  module.exports.VerifyAccount = async (req, res, next) => {

    try {
        const { token } = req.params;

        // Retrieve the signup details from the User model
      const user = await User.findOne({ token:token });
      if (!user) {
        // return res.status(400).json({ message: "Signup details not found" });
        return res.status(400).json({ message: "Internal Server Error" });
  
      }
      const usertoken = createSecretToken(user._id);

      // Check if the entered OTP matches the stored OTP
      if (token != user.token) {
        return res.status(400).json({ message: "Internal Server Error" });
      }
  
   
    user.verified =true
   await user.save();
  
  
    res.status(201).json({ message: "User logged in successfully", success: true, token: usertoken, role: "User", user: user })
 
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
   // forget password
   module.exports.ForgetPassword = async (req, res, next) => {
    const { email } = req.body;
    console.log(req.body)
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Generate a unique token for password reset
      const token = createSecretToken(user._id);
  
      // Save the token to the user in the database
      user.token = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Token expiration time (e.g., 1 hour)
      await user.save();
  
      // Send email with the password reset link containing the token
      const resetLink = `${process.env.PRODUCTION_LINK}reset-password/${token}`;
      console.log(resetLink);
      const mailOptions = {
        from: 'kartavyabhayana1@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `Click <a href="${resetLink}">here</a> to reset your password.`,
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Check your email for password reset instructions' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  };
  module.exports.ResetPassword = async (req, res, next) => {
    const { newPassword } = req.body;
    const { token } = req.params;
  
    try {
      const user = await User.findOne({ token: token });
  
      console.log('User:', user); // Check if user is retrieved
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
  
      // Update user's password and clear/reset the token fields
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      console.log('Updated User:', user); // Check the user object before saving
  
      // Save the updated user with the new password and cleared token fields
      await user.save();
  
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

