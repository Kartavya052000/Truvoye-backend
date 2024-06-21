//OrdersRoute.js: Defines the routes and uses the handlers from OrderController.js

const express = require('express');
const router = express.Router();
const { orderProposal, submitOrder } = require('../Controllers/OrderController');

router.post('/OrderProposal', orderProposal);
router.post('/SubmitOrder', submitOrder);


module.exports = router;
