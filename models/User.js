const mongoose=require('mongoose')
const { resetPasswordToken } = require('../controllers/resetPassword')
const userSchema=new mongoose.Schema(
    {
           firstName:{
            type:String,
            required:true,
            trim:true

           },
            lastName:{
                type:String,
                required:true,
                trim:true
           },
        email:{
            type:String,
            required:true,
            trim:true
        },
      password:{
        type:String,
        required:true,
      },
      accountType:{
        type:String,
        required:true,
        enum:['Student','Admin','Instructor']
      },
      	active: {
			type: Boolean,
			default: true,
		},
      approved: {
        type: Boolean,
        default: true,
      },
      additionalDetails:{
             type:mongoose.Schema.Types.ObjectId,
             required:true,
             ref:"Profile"
      },
      courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
      }],
      image:{
        type:String,
        required:true
      },
      courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"
        }
      ],
      token:{
        type:String,
        trim:true
      },
      resetPasswordExpires: {
           type:Date
      }
    },{createdAt:true}
)
const User=mongoose.model('User',userSchema)
module.exports=User