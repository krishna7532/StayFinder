const User=require("../models/user.js");

// GET /signup - Render user registration form
module.exports.renderSignup=(req,res)=>{
    res.render("users/signup.ejs");
};

// POST /signup - Register a new user and authenticate session
module.exports.signup=async (req,res,next)=>{
    try{
        let {username,email,password}=req.body;
        let newUser=new User({email,username});
        let registerdUser=await User.register(newUser,password);
        console.log(registerdUser);
        req.login(registerdUser,(err)=>{
            if(err) { return next(err); }
            req.flash("success","Welcome to StayFinder");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

// GET /login - Render user login form
module.exports.renderLogin=(req,res)=>{
    res.render("users/login.ejs");
};

// POST /login - Authenticate user and establish session
module.exports.login=async (req,res)=>{
    req.flash("success","Welcome back to StayFinder !");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// GET /logout - Destroy user session and logout
module.exports.logout=(req,res,next)=>{
    req.logOut((err)=>{
        if(err) { return next(err); }
        req.flash("success","Logout successful !");
        res.redirect("/listings");
    });
};