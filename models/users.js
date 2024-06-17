const  mongoose = require("mongoose")

const plm = require("passport-local-mongoose")



const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password :{
      type:String,
      select:false
    },
    category:String,
    secret:String,
    adress:String,
    like:{
        type:Array,
        default:[],
    },
    cart : [
      {
        pro:{
          type : mongoose.Schema.Types.ObjectId,
          ref : 'product',
  
        },
        quantity:Number
      }
    ],
     
      wishlist : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'product'
      }],
      product :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'product'
      }],
      SUM:Number,
  

    
})
userSchema.plugin(plm)
module.exports = mongoose.model("user",userSchema)
