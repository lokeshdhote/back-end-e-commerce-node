// Import the async error handler
const { catchAsyncErrors } = require("../middleWares/catchAsyncError.js");
const productModel = require("../models/product.js");
const userModel = require("../models/users.js")
const ErrorHandler = require("../utils/ErrorHandler.js");

exports.indexpage = catchAsyncErrors(async (req, res, next) => {
    res.render("index");
});


exports.homepage = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findOne({
        username: req.session.passport.user,
      });
    
      const product = await productModel.find({});
    // res.json({product,user})
    res.render("home",{product,user})
});


exports.detailpage = catchAsyncErrors(async (req, res, next) => {
    res.render("item.ejs");
});

exports.createProductpage = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findOne({
        username: req.session.passport.user,
      })
    console.log(req.file.filename)
    console.log(req.body);
  
      const product = await productModel.create({
        price: req.body.price,
        title: req.body.title,
        rating : req.body.rating,
        categoryGender:req.body.categoryGender,
        brand : req.body.brand,
        description : req.body.description,
        specification : req.body.specification,
        availability : req.body.availability,
        category : req.body.category,
        img: req.file.filename
      });
      product.user = user._id;
      user.product.push(product._id);
  
      await user.save();
      await product.save();
  
      res.redirect("/home");
});
exports.bookpage = catchAsyncErrors(async (req,res,next)=>{
    const user = await userModel.findOne({
        username: req.session.passport.user,
      }).populate({
        path: "cart.pro",
        
      })
    
      const product = await productModel.find({});
      res.json({user, product})
      res.render("book.ejs",)
})
exports.Wishlistpage = catchAsyncErrors(async (req,res,next)=>{
    const user = await userModel.findOne({
        username: req.session.passport.user,
      }).populate("wishlist");
    const product = await productModel.find({});
//   res.json({user,product })
    res.render("wishlist.ejs", {user,product });
})
exports.removeLikeid = catchAsyncErrors(async (req,res,next)=>{
    // res.send(req.params.wishId)

    const loggedInUser = await userModel.findOne({
        username: req.session.passport.user,
      });
  
      const product = await productModel.findOne({ _id: req.params.wishId });
  
      let index = loggedInUser.wishlist.indexOf(product._id);
      loggedInUser.wishlist.splice(index, 1);
      await loggedInUser.save();
  
      loggedInUser.populate("wishlist");
      res.redirect("/wishlist");
    
})
exports.profilepage = catchAsyncErrors(async (req,res,next)=>{
    const user = await userModel.findOne({
        username: req.session.passport.user,
      });
    // res.json({user})
      res.render("profile.ejs", { user });
})

exports.postproductpage = catchAsyncErrors(async (req,res,next)=>{
    const product = await productModel.find({});
  console.log(product.img);
//   res.json({ product })
  res.render("postproduct.ejs", ); 
})
exports.likeProductid = catchAsyncErrors(async (req,res,next)=>{
    const loggedInUser = await userModel.findOne({
        username: req.session.passport.user,
      });
    
      const product = await productModel.findOne({ _id: req.params.productId });
    
      if (loggedInUser.wishlist.indexOf(product._id) === -1) {
        loggedInUser.wishlist.push(product._id);
      } else {
        let index = loggedInUser.wishlist.indexOf(product._id);
        loggedInUser.wishlist.splice(index, 1);
      }
    
      await loggedInUser.save();
      const user = await userModel
        .findOne({
          username: req.session.passport.user,
        })
        .populate("wishlist");
    
      // res.status(200).json(user)
      res.redirect("/home");
})
exports.productpage = catchAsyncErrors(async (req,res,next)=>{
  const product = await productModel.find({});
    res.json({product})
})
// exports.page = catchAsyncErrors(async (req,res,next)=>{
    
// })
// exports.page = catchAsyncErrors(async (req,res,next)=>{
    
// })