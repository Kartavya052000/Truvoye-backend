const {
  ResetPassword,
  Add,
  Get,
  Edit,
  ForgetPassword,
  Login,
  Search,
  GetOrders,
  UpdateOrder,
  GenerateOTP,
  VerifyOTP,
} = require("../Controllers/DriverController");
const userVerification = require("../Middlewares/AuthMiddleware");

const router = require("express").Router();

router.post("/add", userVerification, Add);
router.post("/reset-password/:token", ResetPassword);
router.post("/login", Login);
router.post("/forget-password", ForgetPassword);
router.post("/get/:id?", userVerification, Get);
router.post("/edit/:id", userVerification, Edit);
router.post("/search", userVerification, Search);
router.post("/getOrders/?",userVerification, GetOrders);
router.post("/updateOrder/?",userVerification, UpdateOrder);
router.post("/generateOTP/?",userVerification, GenerateOTP);
router.post("/verifyOTP/?",userVerification, VerifyOTP);

module.exports = router;
