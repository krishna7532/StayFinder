const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateString}=require("../middleware.js");

//show all listings (index route)
router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
   res.render("listings/index",{allListings});
}));
//add new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new");
});
router.post("/",isLoggedIn,validateString,wrapAsync(async (req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New listing created !");
    res.redirect("/listings");
}));

//show one in details(show route)
router.get("/:id",wrapAsync(async (req,res)=>{
     let {id}=req.params;
     const listing=await Listing.findById(id)
     .populate({
         path: "reviews",
         populate: {
             path: "author",
             model: "User"
         }
     })
     .populate("owner");
      if(!listing){
        req.flash("error","List you request does not exist");
        return res.redirect("/listings");
    }
     res.render("listings/show",{listing});
}));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit",{listing});
}));

router.put("/:id",isOwner,validateString,wrapAsync(async (req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports=router;