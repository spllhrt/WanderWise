const multer = require('multer');


// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Save uploaded files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Prefix files with timestamp for uniqueness
    }
});


// Create the multer instance with the defined storage settings
const upload = multer({ storage: storage });


module.exports = upload;
