
// controllers/contactController.js
const ContactDetail = require("../Models/ContactModel");

exports.createContact = async (req, res) => {
  const { contact_fullname, contact_email, contact_message } = req.body;

  const newContact = new ContactDetail({
    contact_fullname,
    contact_email,
    contact_message,
  });

  try {
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
