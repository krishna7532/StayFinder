const Listing = require("../models/listing.js");

const geocodeLocation = async (location, country) => {
    const query = [location, country].filter(Boolean).join(", ");
    const urlGeocode =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
            q: query,
            format: "jsonv2",
            limit: 1
        });

    const response = await fetch(urlGeocode, {
        headers: {
            "User-Agent": "MyLocationApp/1.0 (your@email.com)",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No coordinates found for "${query}"`);
    }

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error(`Invalid coordinates returned for "${query}"`);
    }

    return {
        type: "Point",
        coordinates: [longitude, latitude]
    };
};

const { CATEGORIES, PROPERTY_TYPES, AMENITIES } = require("../models/listing.js");

// GET /listings - Display all listings with dynamic search & filter support
module.exports.index = async (req, res) => {
    const { location, category, propertyType, amenities, minPrice, maxPrice, filter, sort } = req.query;

    const mongoQuery = {};

    // 1. Location Search (Safe regex, case-insensitive partial match across location and country)
    if (typeof location === "string" && location.trim() !== "") {
        const sanitizedLocation = location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        mongoQuery.$or = [
            { location: { $regex: sanitizedLocation, $options: "i" } },
            { country: { $regex: sanitizedLocation, $options: "i" } }
        ];
    }

    // 2. Direct Category Filter
    if (category && CATEGORIES.includes(category)) {
        mongoQuery.category = category;
    }

    // 3. Direct Property Type Filter
    if (propertyType && PROPERTY_TYPES.includes(propertyType)) {
        mongoQuery.propertyType = propertyType;
    }

    // 4. Amenities Filter (supports single value or array of values)
    if (amenities) {
        const rawList = Array.isArray(amenities) ? amenities : [amenities];
        const validAmenities = rawList.filter(a => AMENITIES.includes(a));
        if (validAmenities.length > 0) {
            mongoQuery.amenities = { $all: validAmenities };
        }
    }

    // 5. Price Range Filter
    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== "") {
        const min = Number(minPrice);
        if (!isNaN(min) && min >= 0) {
            priceFilter.$gte = min;
        }
    }
    if (maxPrice !== undefined && maxPrice !== "") {
        const max = Number(maxPrice);
        if (!isNaN(max) && max >= 0) {
            priceFilter.$lte = max;
        }
    }
    if (Object.keys(priceFilter).length > 0) {
        mongoQuery.price = priceFilter;
    }

    // 6. UI Category / Filter Pill Shortcuts
    let activeFilter = "";
    let sortOption = { createdAt: -1 };

    if (filter) {
        const lowerFilter = String(filter).toLowerCase();
        activeFilter = lowerFilter;

        if (lowerFilter === "rooms") {
            mongoQuery.propertyType = "Room";
        } else if (lowerFilter === "beach") {
            mongoQuery.category = "Beach";
        } else if (lowerFilter === "mountains") {
            mongoQuery.category = "Mountains";
        } else if (lowerFilter === "city") {
            mongoQuery.category = "City";
        } else if (lowerFilter === "countryside") {
            mongoQuery.category = "Countryside";
        } else if (lowerFilter === "pool") {
            mongoQuery.amenities = { $in: ["Pool"] };
        } else if (lowerFilter === "pet-friendly" || lowerFilter === "pet friendly") {
            mongoQuery.amenities = { $in: ["Pet Friendly"] };
            activeFilter = "pet-friendly";
        } else if (lowerFilter === "luxury") {
            mongoQuery.category = "Luxury";
        } else if (lowerFilter === "budget") {
            // Budget: price <= 1500 INR, sorted low-to-high
            mongoQuery.price = { ...(mongoQuery.price || {}), $lte: 1500 };
            sortOption = { price: 1 };
        } else if (lowerFilter === "trending") {
            // Handled below via reviews count sorting
        }
    }

    // 7. Explicit Sort Option
    if (sort === "price-low") {
        sortOption = { price: 1 };
    } else if (sort === "price-high") {
        sortOption = { price: -1 };
    } else if (sort === "newest") {
        sortOption = { createdAt: -1 };
    }

    let allListings = await Listing.find(mongoQuery).populate("reviews").sort(sortOption);

    // If Trending is selected, prioritize listings with the most reviews/ratings
    if (activeFilter === "trending") {
        allListings.sort((a, b) => {
            const countA = (a.reviews && a.reviews.length) || 0;
            const countB = (b.reviews && b.reviews.length) || 0;
            if (countB !== countA) {
                return countB - countA;
            }
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }

    res.render("listings/index", {
        allListings,
        query: req.query,
        activeFilter
    });
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


const location = req.body.listing.location;

const urlGeocode =
  "https://nominatim.openstreetmap.org/search?" +
  new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: 1
  });

const response = await fetch(urlGeocode, {
  headers: {
    "User-Agent": "MyLocationApp/1.0 (your@email.com)",
    "Accept": "application/json"
  }
});

console.log("Status:", response.status);

const data = await response.json();

const result = data[0];

const latitude = Number(result.lat);
const longitude = Number(result.lon);

//create geoJSON
const geometry = {
  type: "Point",
  coordinates: [longitude, latitude]
};
 console.log(geometry);
      
        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geometry;
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
        return res.redirect("/listings");
    }
    let originalImgaeUrl = listing.image.url;
    originalImgaeUrl = originalImgaeUrl.replace("/upload", "/upload/w_256");
    res.render("listings/edit", { listing, originalImgaeUrl });
};

// PATCH /listings/:id - Update listing data in database
module.exports.editRouteData = async (req, res) => {
    let { id } = req.params;
    if (req.body.listing && typeof req.body.listing.amenities === "string") {
        req.body.listing.amenities = req.body.listing.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
    }
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
