const  mongoose = require("mongoose")
const bcrypt = require("bcrypt")
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

userSchema.pre("save",function (){
  if(!this.isModified("password")){
      return;
  }
  
      let salt = bcrypt.genSaltSync(10)
      this.password = bcrypt.hashSync(this.password,salt)
  
  })
  
  userSchema.methods.comparepassword =function (password) {
      return bcrypt.compareSync(password , this.password)
      
  }

userSchema.plugin(plm)
module.exports = mongoose.model("user",userSchema)
