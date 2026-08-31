const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateString}=require("../middleware.js");
const listingController=require("../controller/listing.js");

//show all listings (index route)
router.get("/",wrapAsync(listingController.index));
//add new route
router.get("/new",isLoggedIn,listingController.renderForm);
router.post("/",isLoggedIn,validateString,wrapAsync(listingController.infoForPost));

//show one in details(show route)
router.get("/:id",wrapAsync(listingController.showPostInDetails));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editRoute));
router.put("/:id",isOwner,validateString,wrapAsync(listingController.editRouteData));
//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyRoute));

module.exports=router;