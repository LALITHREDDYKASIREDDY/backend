const Section=require('../models/Section')
const SubSection=require('../models/SubSection')
const User=require('../models/User')
const {uploadImage}=require('../utils/imageUploader')
exports.createSubSection=async (req,res)=>{
    try{
        //data fetching
      const {title,description,sectionId }=req.body
      console.log(sectionId)
      console.log(req.body)
      // data validation
      if (!sectionId || !title || !description ) {
        return res
          .status(404)
          .json({ success: false, message: "All Fields are Required" })
      }
      //video obj
      const file=req.files.video
      console.log(file)
      //video uploading to cloudinary
      const uploadDetails = await uploadImage(
        file,
        process.env.FOLDER_NAME
      )
      //sub section creation
      const subSection=await SubSection.create({
        title,
        description,
        timeDuration: `${uploadDetails.duration}`,
        videoUrl:uploadDetails.secure_url
      })  
      // update section
      const updateSection=await Section.findByIdAndUpdate(sectionId,{$push:{
        subSection:subSection._id
      }},{new:true}).populate("subSection")
   
      return res.json({ success: true, data: updateSection })
    }
    catch(error)
    {
        res.status(500).json({
          error:error.message,
            success:false,
            message:"something went wrong ,try again"
        })
    }
}

  exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImage(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      const details=await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subSection")


      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
       
        success: false,
        message: "An error occurred while updating the section",
        error:error.message,
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
      
      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data:updatedSection
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }