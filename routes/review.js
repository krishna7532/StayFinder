const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
require("../schema.js");
const reviewController=require("../controller/review.js");
const {validateReview, isLoggedIn,isAuthorReview}=require("../middleware.js");

//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId",isLoggedIn,isAuthorReview,wrapAsync(reviewController.destroyReview));

module.exports=router;