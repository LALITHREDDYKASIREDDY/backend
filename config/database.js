const mongoose=require('mongoose')
require('dotenv').config()
const connect=()=>{
       mongoose.connect(process.env.DB_URL,{useNewUrlParser:true,useUnifiedTopology:true})
       .then((result)=>{
        console.log("connection to db is successful")
       })
       .catch((error)=>{
        console.log("connection to db failed")
        console.log(error)
        process.exit(1)
       })
}
module.exports=connect;