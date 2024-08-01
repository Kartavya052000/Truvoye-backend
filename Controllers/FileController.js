const path = require('path');


module.exports.downloadProposal = async (req, res, next) => {

    const filename = req.params.filename;
    console.log(filename)
    const filePath = path.join(__dirname, 'Uploads', filename);
    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });

}