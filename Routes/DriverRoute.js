const { ResetPassword, Add, Get, Edit, ForgetPassword, Login } = require('../Controllers/DriverController');

const router = require('express').Router()

router.post('/add', Add);
router.post('/reset-password/:token', ResetPassword);
router.post('/login', Login);
router.post('/forget-password', ForgetPassword);
router.post('/get/:id?', Get);
router.post('/edit/:id', Edit);

module.exports = router