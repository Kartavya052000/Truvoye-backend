const express = require('express');
const router = express.Router();
const fileController = require('../Controllers/FileController.js');

router.get('/download-proposal', fileController.downloadProposal);

module.exports = router;
