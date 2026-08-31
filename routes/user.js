const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const { saveRediretUrl } = require("../middleware.js");
const userController=require("../controller/user.js");

//Sign-up
router.get("/signup",userController.renderSignup);
router.post("/signup", wrapAsync(userController.signup));

//Login
router.get("/login",userController.renderLogin);

router.post("/login",
    saveRediretUrl,
    passport.authenticate("local",{ failureRedirect: "/login" ,failureFlash: true}),
    userController.login);

//logout
router.get("/logout",userController.logout);

module.exports=router;