//OrdersRoute.js: Defines the routes and uses the handlers from OrderController.js

const express = require('express');
const router = express.Router();
const { orderProposal, submitOrder, get, search, assignOrderToDriver, getStatusReport } = require('../Controllers/OrderController');
const userVerification = require('../Middlewares/AuthMiddleware');

// router.post('/OrderProposal',userVerification, orderProposal);
router.post('/OrderProposal', orderProposal);
router.post('/SubmitOrder',userVerification, submitOrder);
router.post('/get/:id?', get);
router.post('/search',userVerification, search);
router.post('/assign-order',userVerification, assignOrderToDriver);
router.post('/statusReport', userVerification, getStatusReport);



module.exports = router;
