//sending otp
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
const {passwordUpdated}=require('../mail templates/passwordUpdate')
require("dotenv").config();
exports.sendOtp=async (req,res)=>{
    try{
    const email=req.body.email
    //check whether user exists or not
    const checkUser=await User.findOne({email})
    if(checkUser){
        return res.status(401).json(
            { 
                success:false,
                message:'user already exists '
            })
    }
    //generating otp
    const otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    })
    //check whether otp is unique
    const checkOtp=await Otp.findOne({otp})
    while(checkOtp)
    {
        const otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })
        const checkOtp=await Otp.findOne({otp})
    }
    const otpPayload={email,otp}
    //create an entry in db  in otp collection
    const otpentry=await Otp.create(otpPayload)
    console.log(otpentry)
     res.json(
        {
            success:true,
            message:"otp sent successfully",
            otp
        }
     )
    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({
            success:false,
            message:'something went wrong  '
        })
    }
}

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
	try {
        console.log(req.body)
		// Destructure fields from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			otp,
		} = req.body;
		// Check if All Details are there or not
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		// Find the most recent OTP for the email
		const response = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

		// Create the Additional Profile For User
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});
        console.log('here')
		const user = await User.create({
			firstName,
			lastName,
			password: hashedPassword,
			accountType: accountType,
            email,
			contactNumber,
			approved: approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};
exports.login=async (req,res)=>{
    try{
         //get data from req body
         console.log(req.body)
         const {email,password}=req.body
         //validate data
         if(!email||!password)
         {
            return res.status(401).json(
                 {
                     success:false,
                     message:"please fill all fields"
                 }
             )
         }
         // check user whether he exists or not 
         const user=await User.findOne({email}).populate('additionalDetails').exec()
     //user already exist or not
     if(!user)
     {
        return res.status(401).json(
            {
                success:false,
                message:"this email is not registered with us.Create  account "
              
            }
        )
     }
         //if password matches generate jwt token 
         console.log(password)
         console.log(await bcrypt.compare(password,user.password) )
         if(await bcrypt.compare(password,user.password))
         {
                    const payload={
                        id:user._id,
                        email:user.email,
                        role:user.accountType
                    }
                let token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '2h'})
                user.token=token
                user.password=undefined
                const options={
                    expire:new Date(Date.now()+3*24*60*60*1000),
                    httpOnly:true
                }
                 //store jwt token into cookie
                res.cookie('token',token,options).json(
                    {
                        success:true,
                        message:'logged in successfully',
                        user,
                        token
                    }
                )

        }
         //pass doesnt match
         else{
            res.status(400).json(
                {
                    success:false,
                    message:"enter the right password"
                }
            )
         }

    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:'login failed. Something went wrong',
        })
    }
}
exports.changePassword=async (req,res)=>{
    try{
        //data from req body
        const userDetails = await User.findById(req.user.id);
        const {oldPassword,newPassword,confirmNewPassword}=req.body
        //validation
        if(!oldPassword ||!newPassword||!confirmNewPassword){
            return res.status(401).json(
                {
                    success:false,
                    message:"please fill all fields"
                }
            )
        } 
        // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}
        if(newPassword!==confirmNewPassword)
        {
            return res.status(401).json(
                {
                    success:false,
                    message:"password doesnt match"
                }
            )
        }
        //update password in db
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);
        // send mail that password updated
        try{
            const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
        }
        catch(error){
            console.log("error occured in sending email")
            console.log(error)
        }
        	// Return success response
		return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    }
    catch(error)
    {
        
        res.status(500).json({
            success:false,
            message:'something went wrong',
        })
    }
}