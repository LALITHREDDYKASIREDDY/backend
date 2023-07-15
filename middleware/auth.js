const jwt=require('jsonwebtoken')
const User=require('../models/User')
require('dotenv').config()
exports.auth=(req,res,next)=>
{
    try{       
       const token = req.cookies.token 
      || req.body.token 
      || req.header("Authorisation").replace("Bearer ", "");
      console.log(req.body)
      if(!token)
      {
         return res.status(400).json({
           succes:false,
           message:'token is missing'
         })
      } 
      try{
       const payload=jwt.verify(token,process.env.JWT_SECRET)
       req.user=payload;
       
     }
     catch(error)
     {
        return res.status(400).json({
            succes:false,
            message:'token is invalid or expired'
          })
     }
     next();
    }
    catch(error)
    {
        res.status(500).json({
            succes:false,
            message:error.message,
        })   
    }
}
exports.isStudent=(req,res,next)=>
{
    try{
      const role=req.user.role;
      if(role!=='Student')
      {
         res.status(400).json({
            succes:false,
            message:'this route is allowed only for student accounts',
        })   
      }
    next()
    }
    catch(error)
    {
        res.status(500).json({
            succes:false,
            message:'authorization failed. Something went wrong',
        })   
    }
}
exports.isInstructor=(req,res,next)=>
{
    try{
      const role=req.user.role;
      if(role!=='Instructor')
      {
         res.status(400).json({
            succes:false,
            message:'this route is allowed only for student accounts',
        })   
      }
      next()
    }
    catch(error)
    {
        res.status(500).json({
            succes:false,
            message:'authorization failed. Something went wrong',
        })   
    }
}
exports.isAdmin=(req,res,next)=>
{
    try{
      const role=req.user.role;
      if(role!=='Admin')
      {
         res.status(400).json({
            succes:false,
            message:'this route is allowed only for student accounts',
        })   
      }
      next()
    }
    catch(error)
    {
        res.status(500).json({
            succes:false,
            message:'authorization failed. Something went wrong',
        })   
    }
}
