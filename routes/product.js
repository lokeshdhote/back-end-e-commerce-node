const  mongoose = require("mongoose")
const { type } = require("os")

// const plm = require("passport-local-mongoose")

const productSchema = mongoose.Schema({
    title:String,
     price:Number,
     img:String,
     description:String,
     rating:Number,
     brand:String,
     specification:String,
availability:Number,
categoryGender:String,
category:String,
     user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"user"
     }
     
 })


// productSchema.plugin(plm)
module.exports = mongoose.model("product",productSchema)
