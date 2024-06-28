//OrdersRoute.js: Defines the routes and uses the handlers from OrderController.js

const express = require('express');
const router = express.Router();
const { orderProposal, submitOrder, get, search } = require('../Controllers/OrderController');
const userVerification = require('../Middlewares/AuthMiddleware');

// router.post('/OrderProposal',userVerification, orderProposal);
router.post('/OrderProposal', orderProposal);
router.post('/SubmitOrder',userVerification, submitOrder);
router.post('/get/:id?',userVerification, get);
router.post('/search',userVerification, search);



module.exports = router;
