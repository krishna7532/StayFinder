/**
 * Migration script: Backfill coordinates for existing listings in the database
 * Run once via: node init/backfillCoordinates.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { getCoordinates } = require("../utils/geoapify.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayFinder";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function backfill() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB for backfill...");

        const listings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": { $exists: false } },
                { "geometry.coordinates": [0, 0] },
                { "geometry.coordinates": { $size: 0 } },
            ],
        });

        console.log(`Found ${listings.length} listings that need coordinates backfill.`);

        let successCount = 0;
        let failCount = 0;

        for (const listing of listings) {
            console.log(`Geocoding "${listing.title}" (${listing.location}, ${listing.country})...`);
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
                await listing.save();
                successCount++;
                console.log(`  ✓ Updated with coordinates: [${geoData.coordinates.join(", ")}]`);
            } else {
                failCount++;
                console.log(`  ✗ Could not find coordinates for: ${listing.location}`);
            }

            // Respect rate limits: 300ms pause
            await delay(300);
        }

        console.log(`\nBackfill complete: ${successCount} updated successfully, ${failCount} failed.`);
    } catch (err) {
        console.error("Backfill failed with error:", err.message);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

backfill();

