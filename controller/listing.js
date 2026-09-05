const Listing=require("../models/listing.js");
const Listing = require("../models/listing.js");
const { getCoordinates } = require("../utils/geoapify.js");

// GET /listings - Display all listings
module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
   res.render("listings/index",{allListings});
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// GET /listings/new - Render form to create a new listing
module.exports.renderForm=(req,res)=>{
module.exports.renderForm = (req, res) => {
    res.render("listings/new");
};

// POST /listings - Create a new listing and save to database
module.exports.infoForPost=async (req,res,next)=>{
module.exports.infoForPost = async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "Image upload failed");
            return res.redirect("/listings/new");
        }
        

        let url = req.file.path;
        let filename = req.file.filename;

        //for location
        let location=req.body.listing.location;
        let country=req.body.listing.country;
        let pin=req.body.listing.pin;
        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // Geocode location using Geoapify server-side
        const geoData = await getCoordinates({
            location: req.body.listing.location,
            country: req.body.listing.country,
            pin: req.body.listing.pin,
        });

        if (geoData) {
            newListing.geometry = {
                type: "Point",
                coordinates: geoData.coordinates,
                formattedAddress: geoData.formattedAddress,
            };
        }

        await newListing.save();
        req.flash("success", "New listing created !");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", err.message);
        res.redirect("/listings/new");
    }
};

// GET /listings/:id - Display details of a specific listing with reviews and owner information
module.exports.showPostInDetails=async (req,res)=>{
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
module.exports.showPostInDetails = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                model: "User",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
     res.render("listings/show",{listing});

    // Lazy caching: If listing has no valid coordinates, geocode and save to DB
    const hasValidCoords =
        listing.geometry &&
        listing.geometry.coordinates &&
        listing.geometry.coordinates.length === 2 &&
        !(listing.geometry.coordinates[0] === 0 && listing.geometry.coordinates[1] === 0);

    if (!hasValidCoords && listing.location) {
        try {
            const geoData = await getCoordinates({
                location: listing.location,
                country: listing.country,
                pin: listing.pin,
            });
            if (geoData) {
                listing.geometry = {
                    type: "Point",
                    coordinates: geoData.coordinates,
                    formattedAddress: geoData.formattedAddress,
                };
                await Listing.findByIdAndUpdate(listing._id, { geometry: listing.geometry });
            }
        } catch (err) {
            console.error("Error auto-geocoding listing:", listing._id, err.message);
        }
    }

    res.render("listings/show", { listing });
};

// GET /listings/:id/edit - Render form to edit an existing listing
module.exports.editRoute=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        req.redirect("/listings");
module.exports.editRoute = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    let originalImgaeUrl=listing.image.url;
    originalImgaeUrl.replace("/upload","/upload/w_256");
    res.render("listings/edit",{listing,originalImgaeUrl});
    let originalImgaeUrl = listing.image.url;
    originalImgaeUrl = originalImgaeUrl.replace("/upload", "/upload/w_256");
    res.render("listings/edit", { listing, originalImgaeUrl });
};

// PATCH /listings/:id - Update listing data in database
module.exports.editRouteData=async (req,res)=>{
    let{id}=req.params;
   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
module.exports.editRouteData = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if(typeof req.file!=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image={url,filename };
    await listing.save();
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    // If location was updated, re-geocode
    if (req.body.listing && req.body.listing.location) {
        const geoData = await getCoordinates({
            location: req.body.listing.location,
            country: req.body.listing.country,
            pin: req.body.listing.pin,
        });
        if (geoData) {
            listing.geometry = {
                type: "Point",
                coordinates: geoData.coordinates,
                formattedAddress: geoData.formattedAddress,
            };
            await listing.save();
        }
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

// DELETE /listings/:id - Delete a listing from database
module.exports.destroyRoute=async (req,res)=>{
    let{id}=req.params;
module.exports.destroyRoute = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};