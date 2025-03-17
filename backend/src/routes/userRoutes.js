const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserClicks,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/click', protect, updateUserClicks);

module.exports = router; 