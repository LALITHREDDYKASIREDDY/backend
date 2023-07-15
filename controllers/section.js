const Section=require('../models/Section')
const Course=require('../models/Course')
const SubSection=require('../models/SubSection')
exports.createSection=async (req,res)=>{
    try{
        //data fetching
        const {sectionName,courseId}=req.body
        //sections validation 
        if(!sectionName||!courseId)
        {
            return res.status(400).json({
                success:false,
                message:"enter the section name "
            })
        } 
        //creation of new section   
        const newSection=await Section.create({sectionName})
        //update course details
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseId,{
            $push:{courseContent:newSection._id}},{new:true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();
        return res.json({
            success:true,
            message:'section created successfully',
            data:updatedCourseDetails
        })
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:"something went wrong ,try again"
        })
    }
}
exports.updateSection=async (req,res)=>{
    try{
        //data fetching
        const {sectionName,sectionId,courseId}=req.body
        //data validation
        if (!sectionName ||!sectionId){
            return  res.status(401).json({
                success: false,
                message: 'please enter all fields'
            })
        }
       const updatedDetails=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
        const updatedCourseDetails=await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        res.json({
            success: true,
            data:updatedCourseDetails,
            message :'section update successfully',
        })
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:"something wentn wrong ,try again"
        })
    }
}
exports.deleteSection=async (req,res)=>{
    try{
        const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:"something wentn wrong ,try again"
        })
    }
}