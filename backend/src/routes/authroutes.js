const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { userSchema } = require("../validations/uservalidation");
const validate = require("../middleware/validate");

// Registration Route
router.post("/register",validate(userSchema), AuthController.register);
// Login Route
router.post("/login", AuthController.login);

// Token Validation Route
router.get("/validate-token", AuthController.validateToken);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);


module.exports = router;
    