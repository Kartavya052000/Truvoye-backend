const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userVerification = async (req, res, next) => {
  try {
    // console.log(req.headers,"HHHH")
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ status: "User token expired" });
    }

    const decodedToken = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_KEY); // Replace "Bearer " with an empty string

    const user = await User.findById(decodedToken.id);

    if (user) {
      req.user = user;  // Attach the user to the request object
      next();  // Pass control to the next middleware/route handler
    } else {
      return res.status(401).json({ status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false });
  }
};

module.exports = userVerification;
