const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require('./catchAsyncError');

exports.isLoggedIn = catchAsyncErrors(async function(req, res, next) {
    const { token } = req.cookies;

    // Check if the token is present
    if (!token) return next(new ErrorHandler("Please login to access the resource", 401));

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'piyush');

        // Attach the user information to the request
        req.id = decoded.user;

      
        // Set new token options
        const options = {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // Cookie expires in 1 day
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 1000 * 60 * 60 * 24 * 5 // 1 day
        };

        // Send the new token in the cookies
        res.cookie("token", options);

        // Proceed to the next middleware
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token. Please login again.", 401));
    }
});





















// const jwt  = require('jsonwebtoken');
// const ErrorHandler = require("../utils/ErrorHandler");
// const {catchAsyncErrors} = require('./catchAsyncError')

// exports.isLoggedIn =  catchAsyncErrors (async function(req,res,next){
//     const {token} = req.cookies;
   
//    if(!token) return next(new ErrorHandler("please login to access the resource",401));
 
//    const {user} = jwt.verify(token,'piyush')
 

//    req.id = user;
   
//     // res.json({id,token})
//     next();
// })  