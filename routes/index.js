var express = require("express");
var router = express.Router();
const userModel = require("./users");
var Razorpay = require('razorpay')
const productModel = require("./product");
const upload = require("./multer");
const passport = require("passport");
const localStrategy = require("passport-local");
const product = require("./product");

var instance = new Razorpay({
  key_id: process.env.key_Id,
  key_secret: process.env.key_Secret,
});

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/products",async function(req,res,next){
  const product = await productModel.find()
  res.json(product)

})

router.get("/home",isLoggedIn ,async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  const product = await productModel.find({});
// res.json(product)
res.render("home",{product,user})


});
router.get("/item", function (req, res, next) {
  res.render("item.ejs");
});


router.get("/likes/:productId", isLoggedIn, async function (req, res, next) {
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
});

router.get("/postproduct", isLoggedIn, async function (req, res, next) {
  const product = await productModel.find({});
  console.log(product.img);
  res.render("postproduct.ejs", { product });
});
////// product create /////
router.post("/pro",isLoggedIn,upload.single("img"), async function (req, res, next) {
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
  }
);
router.post('/create/orderId', async function(req,res){
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
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
router.get("/book",isLoggedIn , async function(req ,res,next){
  
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate({
    path: "cart.pro",
    
  })

  const product = await productModel.find({});
  res.render("book.ejs",{user, product})
})
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

router.get("/wishlist", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
      username: req.session.passport.user,
    }).populate("wishlist");
  const product = await productModel.find({});

  res.render("wishlist.ejs", {user,product });
});

router.get(
  "/likes/remove/:wishId",
  isLoggedIn,
  async function (req, res, next) {
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
  
  }
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
// res.send(user)
  res.render("profile.ejs", { user });
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

router.post("/register", function (req, res, next) {
  var userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    category: req.body.category,
    secret: req.body.secret,
    adress:req.body.adress
  });

  userModel
    .register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
