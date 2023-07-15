const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const {
  login,
  signup,
  sendOtp,
  changePassword,
} = require("../controllers/auth")


// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOtp)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)



module.exports = router