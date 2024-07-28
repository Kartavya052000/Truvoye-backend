const express = require('express');
const router = express.Router();
const fileController = require('../Controllers/FileController.js');

router.get('/download/:filename', fileController.downloadProposal);

module.exports = router;
