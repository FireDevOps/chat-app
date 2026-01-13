const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateAvatar } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.post('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

module.exports = router;