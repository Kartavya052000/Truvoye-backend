// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { createContact } = require("../Controllers/ContactController");


router.post("/", createContact);

module.exports = router;
