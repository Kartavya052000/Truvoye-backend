//OrdersRoute.js: Defines the routes and uses the handlers from OrderController.js

const express = require('express');
const router = express.Router();
const { orderProposal, submitOrder } = require('../Controllers/OrderController');
const userVerification = require('../Middlewares/AuthMiddleware');

router.post('/OrderProposal',userVerification, orderProposal);
router.post('/SubmitOrder',userVerification, submitOrder);


module.exports = router;
