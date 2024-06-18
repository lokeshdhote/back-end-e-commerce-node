var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
var Razorpay = require('razorpay')
const productModel = require("../models/product");
const upload = require("./multer");
const passport = require("passport");
const localStrategy = require("passport-local");
const product = require("../models/product");
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");
const cookieparser=require("cookie-parser")



const { indexpage, homepage, detailpage, createProductpage, bookpage, Wishlistpage, removeLikeid, profilepage, postproductpage, likeProductid, productpage, createOrderId, LoginUser } = require("../controllers/indexController.js");


var instance = new Razorpay({
  key_id: process.env.key_Id,
  key_secret: process.env.key_Secret,
});

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", indexpage);
router.get("/products", productpage);

router.get("/LoginUser",isLoggedIn,LoginUser)
router.get("/home",isLoggedIn ,homepage);

router.get("/detail/:id", detailpage );


router.get("/like/:productId", isLoggedIn,likeProductid);

router.get("/wishlist", isLoggedIn, Wishlistpage);

router.get("/likes/remove/:wishId",isLoggedIn,removeLikeid);

router.get("/profile", isLoggedIn,profilepage );


router.get("/postproduct", isLoggedIn, postproductpage);

////// product create /////
router.post("/pro",isLoggedIn,createProductpage);



router.post('/create/orderId', createOrderId)
router.post("/api/payment/verify",(req,res)=>{

  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256', process.env.key_Secret)
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.response.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.response.razorpay_signature)
    response={"signatureIsValid":"true"}
       res.send(response);
   });
 
router.get("/success",function(req,res){
  res.render("success")
})
router.get("/fail",function(req,res){
  res.render("fail")
})
router.get("/book",isLoggedIn , bookpage)
router.get("/cart", isLoggedIn, async function (req, res, next) {
  
  const user = await userModel.findOne({
      username: req.session.passport.user,
    }).populate({
      path: "cart.pro",
      
    });
    // user.populate("cart")
  // console.log(user.cart.pro)
  const product = await productModel.find({});
  var sum = 0;
  user.cart.forEach((i)=>{
     console.log(i)
    sum += i.pro.price*i.quantity;
  })
  // res.send(user,sum)
user.SUM=sum*100
await user.save();
  res.render("cart.ejs", { user, product,sum });
});


router.get("/cart/add/:id", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  const product = await productModel.findOne({ _id: req.params.id });

  const info = {
    pro: product._id,
    quantity: 1,
  };
  user.cart.push(info);

  await user.save();

  res.redirect("/cart");
});

router.get("/cart/remove/:cartId", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  const product = user.cart.findIndex(
    (i) => i._id.toString() === req.params.cartId
  );
  if (user.cart[product].quantity === 1) {
    const remove = user.cart.filter(
      (i) => i._id.toString() !== req.params.cartId
    );
    user.cart = remove;
    await user.save();
  } else {
    user.cart[product].quantity--;
    await user.save();
  }
  res.redirect("/cart");
});

router.get(
  "/cart/addMore/:cartId",
  isLoggedIn,
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const product = user.cart.findIndex(
      (i) => i._id.toString() === req.params.cartId
    );
    user.cart[product].quantity++;
    await user.save();
    res.redirect("/cart");
  }
);

router.post("/register",async(req,res,next)=>{
  const user = await new userModel(req.body).save()
res.status(201).json(user)
  

});

router.post("/login", async (req, res, next) => {
 
  const { username, password } = req.body;
  let user = await userModel.findOne({ username:username }).select("+password").exec()
          if(!user){
            return next(new ErrorHandler("User with this email if not found",404) )
          }
          const isMatch =  user.comparepassword(req.body.password)
          if(!isMatch){
             return next(new ErrorHandler("Wrong crendentials",404))
          }
          // console.log(req.body);
          // sendtoken(user,200,res)
  
          res.status(200).json(user) 
  })
    
function isLoggedIn() {
  return (req, res, next) => {
    let token = req.cookies.token;
    if (token) {
      jwt.verify(token, "key", (err, result) => {
        if (result) {
          next();
        } else {
          res.redirect("/login");
        }
      });
    } else {
      res.redirect("/login");
    }
  };
}
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("you are logged out");
});



// router.post(
//   "/prouploads",
//   isLoggedIn,
//   async function (req, res) {
//     const product = await productModel.findOne({
//       username: req.session.passport.user,
//     });

//     console.log(req.file.filename);
//     product.img = req.file.filename;
//     await product.save();

//     res.redirect("/postproduct", { product });
//   }
// );

// router.post("/register", function (req, res, next) {
//   console.log(req.params);
//   console.log(req.body);
//   var userdata = new userModel({
//     username: req.body.username,
//     email: req.body.email,
//     category: req.body.category,
//     secret: req.body.secret,
//     adress:req.body.adress
//   });

//   userModel
//     .register(userdata, req.body.password)
//     .then(function (registereduser) {
//       passport.authenticate("local")(req, res, function () {
//         res.redirect("/home");
//       });
//     });
// });

// router.post("/login",passport.authenticate("local", 
//   {
//     successRedirect: "/home",
//     failureRedirect: "/",
//   }),
//   function (req, res) {
// console.log(req.body.formData);

//   }
// );

// router.get("/logout", function (req, res, next) {
//   req.logout(function (err) {
//     if (err) return next(err);
//     res.redirect("/");
//   });
// });

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/");
// }

module.exports = router;
