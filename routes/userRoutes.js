const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post('/signUp', userController.signUp);
router.post('/signIn', userController.signIn);
router.post('/forgotPassword', userController.forgotPassword);
router.get('/resetPassword/:token', userController.resetPassword);
router.post('/setPassword', userController.setPassword);

module.exports = router;
