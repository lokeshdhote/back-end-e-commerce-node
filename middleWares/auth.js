const jwt  = require('jsonwebtoken');
const ErrorHandler = require("../utils/ErrorHandler");
const {catchAsyncErrors} = require('./catchAsyncError')

exports.isLoggedIn =  catchAsyncErrors (async function(req,res,next){
    const {token} = req.cookies;
   
   if(!token) return next(new ErrorHandler("please login to access the resource",401));
 
   const {user} = jwt.verify(token,'piyush')
 

   req.id = user;
   
    // res.json({id,token})
    next();
})  