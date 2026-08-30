const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
require("../schema.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const {validateReview, isLoggedIn,isAuthorReview}=require("../middleware.js");

//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(async (req,res)=>{
      let listing=await Listing.findById(req.params.id);
      let newReview=new Review(req.body.review);
      newReview.author=req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("review save successfully");
    req.flash("success","Review added successfully!");
    res.redirect(`/listings/${req.params.id}`);
}));
//delete review route
router.delete("/:reviewId",isLoggedIn,isAuthorReview,wrapAsync(async (req,res)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;