const RatingAndReview =require('../models/RatingAndReview')
const Course=require('../models/Course')
const mongoose=require('mongoose')
//create rating
exports.createRating=async (req,res)=>{
    try{
       //data fetching
       const userId=req.user.id
       const {rating,review,courseId}=req.body
       //fetch course details
       const courseDetails=await  Course.findOne(
        {_id:courseId,
        studentsEnrolled: {$elemMatch: {$eq: userId} },
    });
    if(!courseDetails) {
        return res.status(404).json({
            success:false,
            message:'Student is not enrolled in the course',
        });
    }
       
       //already given ie no repetition
       const alreadyReviewed=await RatingAndReview.findOne({courseId,userId})
       if(alreadyReviewed)
       {
         return res.status(400).json(
            {
                success: false,
                message:'student is already given the review'
            }
        )
       }
       //create rating
       const newReview=await RatingAndReview.create({
        user:userId,
        rating,review,
        course:courseId

       })
       //add review to course
       const updatedCourseDetails =  await Course.findByIdAndUpdate(courseId,{$push:{
               ratingAndReviews:newReview.id
       }},{new:true})
        res.json({
            success:true,
            message:'rating and review is created successfully'
        })
    }
    catch(error)
    {
        return res.status(500).json(
            {
                success: false,
                message:'something went wrong in review creation, try again'
            }
        )
    }
}
//get average rating
exports.getAverageRating = async (req,res)=>{
    try{
        //get course id
        const courseId=req.body.courseId
        
        const result = await RatingAndReview.aggregate([
            { 
                  $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                  }
           },
           {
              $group:{
                _id:null,
                averageRating:{$avg:'$rating '}
              }
           }
     ])
     if(result.length>0)
     {
        return res.json({
            success:true,
            message:'average calculated',
            averageRating:result[0].averageRating
        })
     }
     else
     {
        return res.status(200).json({
            success:true,
            message:'no rating found',
            averageRating:0
        })
     }
    }
    catch(error){
        return res.status(500).json(
            {
                success: false,
                message:'something went wrong in getting creation, try again'
            }
        )
    }
}
//get all ratings and reviews
exports.getAllRating=async (req,res)=>{
   try{
          
                const allReviews = await RatingAndReview.find({})
                .sort({rating: "desc"})
                .populate({
                    path:"user",
                    select:"firstName lastName email image",
                })
                .populate({
                    path:"course",
                    select: "courseName",
                })
                .exec();
                return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
   }
   catch(error)
   {
        return res.status(500).json(
            {
                success: false,
                message:'something went wrong in getting creation, try again'
            }
        )
   }
}