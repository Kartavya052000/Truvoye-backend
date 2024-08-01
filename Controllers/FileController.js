const path = require('path');
const fs = require('fs'); // To check if file exists


exports.downloadProposal = (req, res) => {
    const filePath = path.join(__dirname, '../Uploads/Truvoye-proposal.pdf');
    console.log('Resolved file path:', filePath); // Make sure this prints the correct path


  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', err);
      return res.status(404).send('File not found');
    }


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Truvoye-project-proposal.pdf');


    res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Internal Server Error');
        }
      });
  });
};