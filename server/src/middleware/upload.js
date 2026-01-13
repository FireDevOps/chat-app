const multer = require('multer');
const path = require('path');

// Config storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the destination directory
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-randomNumber.extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)} ${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;