const Listing = require("../models/listing.js");

// GET /listings - Display all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// GET /listings/new - Render form to create a new listing
module.exports.renderForm = (req, res) => {
    res.render("listings/new");
};

// POST /listings - Create a new listing and save to database
module.exports.infoForPost = async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "Image upload failed");
            return res.redirect("/listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;

        //for location
        let location = req.body.listing.location;
        let country = req.body.listing.country;
        let pin = req.body.listing.pin;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
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
        req.flash("error", "List you request does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

// GET /listings/:id/edit - Render form to edit an existing listing
module.exports.editRoute = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        req.redirect("/listings");
    }
    let originalImgaeUrl = listing.image.url;
    originalImgaeUrl = originalImgaeUrl.replace("/upload", "/upload/w_256");
    res.render("listings/edit", { listing, originalImgaeUrl });
};

// PATCH /listings/:id - Update listing data in database
module.exports.editRouteData = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    res.redirect(`/listings/${id}`);
};

// DELETE /listings/:id - Delete a listing from database
module.exports.destroyRoute = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};
