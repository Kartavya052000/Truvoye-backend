const {Signup,Login,ForgetPassword,ResetPassword,VerifyAccount} = require("../Controllers/AuthController");
const router = require('express').Router()

router.post('/signup', Signup);
router.post('/login', Login)
router.post('/forget-password', ForgetPassword)
router.post('/reset-password/:token',ResetPassword)
router.post('/verify-account/:token',VerifyAccount)


module.exports = router
