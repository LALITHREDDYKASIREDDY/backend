const express = require("express")
const router = express.Router()
const {
    resetPasswordToken,
    resetPassword,
  } = require("../controllers/resetPassword")
  
// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)
module.exports = router