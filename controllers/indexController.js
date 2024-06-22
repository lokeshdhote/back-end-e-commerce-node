// Import the async error handler
const { catchAsyncErrors } = require("../middleWares/catchAsyncError.js");
const productModel = require("../models/product.js");
const userModel = require("../models/users.js")
const ErrorHandler = require("../utils/ErrorHandler.js");

exports.indexpage = catchAsyncErrors(async (req, res, next) => {
    res.render("index");
});
exports.LoginUser = catchAsyncErrors(async (req, res, next) => {
 
   const LogedUser = await userModel.findById(req.id).exec()
   console.log('====================================');
   console.log(LogedUser);
   console.log('====================================');
  res.send(LogedUser)
});


exports.homepage = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.id).exec()
    
      const product = await productModel.find({});
    // res.json({product,user})
    res.render("home",{product,user})
});


exports.detailpage = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.params.id)
const data = await productModel.findOne({_id:req.params.id})

    res.json(data)
});

exports.createProductpage = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.id).exec();
   
  const product = await new productModel(req.body).save()
      // const product = await productModel.create({
      //   price: req.body.price,
      //   title: req.body.title,
      //   rating : req.body.rating,
      //   categoryGender:req.body.categoryGender,
      //   brand : req.body.brand,
      //   description : req.body.description,
      //   specification : req.body.specification,
      //   availability : req.body.availability,
      //   category : req.body.category,
      //   img: req.body.img
      // });
      product.user = user._id;
      user.product.push(product._id);
  
      await user.save();
      await product.save();
  
      res.redirect("/home");
});
exports.bookpage = catchAsyncErrors(async (req,res,next)=>{
    const user = await userModel.findById(req.id).exec().populate({
        path: "cart.pro",
        
      })
    
      const product = await productModel.find({});
      res.json({user, product})
      res.render("book.ejs",)
})
exports.Wishlistpage = catchAsyncErrors(async (req,res,next)=>{
    const  user = await userModel.findById(req.id).populate("wishlist").exec()
    console.log(user);
    const product = await productModel.find({});
  res.json(user)
console.log(user);
    // res.render("wishlist.ejs", {user,product });
})
exports. removeLikeid = catchAsyncErrors(async (req,res,next)=>{
    // res.send(req.params.wishId)

    const loggedInUser = await userModel.findById(req.id).exec()
  
      const product = await productModel.findOne({ _id: req.params.wishId });
  
      let index = loggedInUser.wishlist.indexOf(product._id);
      loggedInUser.wishlist.splice(index, 1);
      await loggedInUser.save();
  
      loggedInUser.populate("wishlist");
      res.redirect("/wishlist");
    
})
exports.profilepage = catchAsyncErrors(async (req, res, next) => {
  try {
      const user = await userModel.findById(req.id).exec();
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (err) {
      // Handle the error
      console.error('Error fetching user:', err);
      res.status(500).json({ message: 'Server error' });
  }
});


exports.postproductpage = catchAsyncErrors(async (req,res,next)=>{
    const product = await productModel.find({});
  console.log(product.img);
//   res.json({ product })
  res.render("postProduct.ejs", ); 
})
exports.likeProductid = catchAsyncErrors(async (req,res,next)=>{
    const loggedInUser = await userModel.findById(req.id).exec()

    
      const product = await productModel.findOne({ _id: req.params.id });
    
      if (loggedInUser.wishlist.indexOf(product._id) === -1) {
        loggedInUser.wishlist.push(product._id);
      } else {
        let index = loggedInUser.wishlist.indexOf(product._id);
        loggedInUser.wishlist.splice(index, 1);
      }
    
      await loggedInUser.save();
 const user = await userModel.findById(req.id).populate("wishlist").exec()

    // console.log(user);
      res.json(user)

})
exports.productpage = catchAsyncErrors(async (req,res,next)=>{
  const product = await productModel.find({});
  
    res.json(product)
})
exports.createOrderId = catchAsyncErrors(async (req,res,next)=>{
  const user = await userModel.findById(req.id).exec()
  var options = {
    amount: user.SUM,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    return res.send(order)

  });  
})

exports.cartAdd = catchAsyncErrors(async (req, res, next) => {
  try {
    // Find the user by ID
    const user = await userModel.findById(req.id).exec(); // Use req.user.id assuming middleware sets req.user

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product is already in the cart
    const existingProductIndex = user.cart.findIndex(
      (item) => item.pro.toString() === req.params.id
    );

    if (existingProductIndex !== -1) {
      // Product already in cart, respond appropriately
      return res.status(200).json({ error: "Product already in cart" });
    }

    // Find the product by ID
    const product = await productModel.findById(req.params.id).exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create the cart item info
    const info = {
      pro: product._id,
      quantity: 1,
    };

    // Add the product to the user's cart
    user.cart.push(info);

    // Save the user document
    await user.save();

    // Populate the cart products for the response
    const populatedUser = await userModel.findById(req.id).populate("cart.pro").exec();

    // Respond with the updated user object
    res.json(populatedUser);

  } catch (error) {
    console.error(error);
    next(error);
  }
});
exports.removeItem = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user by ID
    const user = await userModel.findById(req.id).exec() // Use req.user.id assuming req.user is set by isLoggedIn middleware
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the product in the user's cart
    const productIndex = user.cart.findIndex((item) => item.pro._id.toString() === req.params.id);
console.log(productIndex);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    // Check the quantity of the product and update the cart accordingly
    if (user.cart[productIndex].quantity === 1) {
      // Remove the product from the cart
      user.cart = user.cart.filter((item) => item.pro._id.toString() !== req.params.id);
    } else {
      // Decrease the product quantity by 1
      user.cart[productIndex].quantity--;
    }

    // Save the updated user document
    await user.save();

    // Fetch the updated user with populated cart details
    const updatedUser =await userModel.findById(req.id).populate("cart.pro").exec();

    // Respond with the updated user object
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error); // Passes the error to the next middleware
  }
})
exports.addMoreItem = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user by ID
    const user = await userModel.findById(req.id).exec(); // Use req.user.id assuming isLoggedIn sets req.user

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the product in the user's cart
    const productIndex = user.cart.findIndex((item) => item.pro._id.toString() === req.params.id);

    if (productIndex === -1) {
      return res.status(200).json({ error: "Product not found in cart" });
    }

    // Increase the product quantity
    user.cart[productIndex].quantity++;

    // Save the updated user document
    await user.save();

    // Optionally, populate the cart with product details for the response
    const updatedUser = await userModel.findById(req.id).populate("cart.pro").exec();

    // Respond with the updated cart
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to the next middleware for centralized handling
  }
})
