// nodemailerConfig.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kartavyabhayana1@gmail.com', // Replace with your Gmail email address
    pass: 'rqml uito ejgl kptc', // Replace with your Gmail password
  },
});

module.exports = transporter;
