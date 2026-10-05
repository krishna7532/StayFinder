const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/stayFinder";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB for migration...");

    const allListings = await Listing.find({});
    console.log(`Found ${allListings.length} listings to inspect/update.`);

    let updatedCount = 0;

    for (const listing of allListings) {
        const text = `${listing.title || ""} ${listing.description || ""}`.toLowerCase();

        // 1. Infer Category
        let category = "Other";
        if (text.includes("beach") || text.includes("ocean") || text.includes("coast")) {
            category = "Beach";
        } else if (text.includes("mountain") || text.includes("ski") || text.includes("alps") || text.includes("chalet") || text.includes("cabin")) {
            category = "Mountains";
        } else if (text.includes("city") || text.includes("downtown") || text.includes("urban") || text.includes("loft") || text.includes("canal")) {
            category = "City";
        } else if (text.includes("countryside") || text.includes("cotswolds") || text.includes("lake") || text.includes("treehouse") || text.includes("farm")) {
            category = "Countryside";
        } else if (text.includes("luxury") || text.includes("villa") || (listing.price && listing.price >= 3500)) {
            category = "Luxury";
        }

        // 2. Infer Property Type
        let propertyType = "House";
        if (text.includes("room") || text.includes("private room")) {
            propertyType = "Room";
        } else if (text.includes("villa")) {
            propertyType = "Villa";
        } else if (text.includes("loft") || text.includes("condo") || text.includes("penthouse") || text.includes("apartment")) {
            propertyType = "Apartment";
        } else if (text.includes("hotel") || text.includes("lodge") || text.includes("resort") || text.includes("chalet")) {
            propertyType = "Hotel";
        }

        // 3. Infer Amenities
        const amenities = [];
        if (text.includes("pool") || text.includes("beach") || text.includes("resort") || text.includes("island") || text.includes("luxury")) {
            amenities.push("Pool");
        }
        if (text.includes("pet") || text.includes("cottage") || text.includes("cabin") || text.includes("treehouse")) {
            amenities.push("Pet Friendly");
        }
        amenities.push("WiFi");
        if (text.includes("city") || text.includes("loft") || text.includes("luxury") || text.includes("villa")) {
            amenities.push("AC");
        }
        if (text.includes("cottage") || text.includes("villa") || text.includes("house") || text.includes("chalet")) {
            amenities.push("Parking");
        }

        // Update document if not already populated with specific values
        let isModified = false;
        if (!listing.category || listing.category === "Other") {
            listing.category = category;
            isModified = true;
        }
        if (!listing.propertyType || listing.propertyType === "Other") {
            listing.propertyType = propertyType;
            isModified = true;
        }
        if (!listing.amenities || listing.amenities.length === 0) {
            listing.amenities = amenities;
            isModified = true;
        }

        if (isModified) {
            await listing.save();
            updatedCount++;
        }
    }

    console.log(`Migration complete! Updated ${updatedCount} listings with category, propertyType, and amenities.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
