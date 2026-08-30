const Listing=require("./models/listing");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema,reviewSchema }=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","To create a new listing You must be logged in");
       return res.redirect("/login");
    }
    next();
};

module.exports.saveRediretUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let { id }=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing");
      return res.redirect(`/listings/${id}`);
    };
    next();
};

module.exports.validateString=(req,res,next)=>{
     const {error}=listingSchema.validate(req.body.listing);
    if(error){
         throw new ExpressError(400,error.details[0].message);
    }else{
        next();
    };
};

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error.details[0].message);
    }
    next();
};

module.exports.isAuthorReview=async (req,res,next)=>{
    let { id,reviewId }=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not created this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
}