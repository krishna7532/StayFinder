const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayFinder";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const enrichListing = (obj) => {
  const text = `${obj.title || ""} ${obj.description || ""}`.toLowerCase();

  let category = "Other";
  if (text.includes("beach") || text.includes("ocean") || text.includes("coast")) category = "Beach";
  else if (text.includes("mountain") || text.includes("ski") || text.includes("alps") || text.includes("chalet") || text.includes("cabin")) category = "Mountains";
  else if (text.includes("city") || text.includes("downtown") || text.includes("urban") || text.includes("loft") || text.includes("canal")) category = "City";
  else if (text.includes("countryside") || text.includes("cotswolds") || text.includes("lake") || text.includes("treehouse") || text.includes("farm")) category = "Countryside";
  else if (text.includes("luxury") || text.includes("villa") || (obj.price && obj.price >= 3500)) category = "Luxury";

  let propertyType = "House";
  if (text.includes("room") || text.includes("private room")) propertyType = "Room";
  else if (text.includes("villa")) propertyType = "Villa";
  else if (text.includes("loft") || text.includes("apartment") || text.includes("penthouse") || text.includes("condo")) propertyType = "Apartment";
  else if (text.includes("hotel") || text.includes("lodge") || text.includes("resort") || text.includes("chalet")) propertyType = "Hotel";

  const amenities = [];
  if (text.includes("pool") || text.includes("beach") || text.includes("resort") || text.includes("island") || text.includes("luxury")) amenities.push("Pool");
  if (text.includes("pet") || text.includes("cottage") || text.includes("cabin") || text.includes("treehouse")) amenities.push("Pet Friendly");
  amenities.push("WiFi");
  if (text.includes("city") || text.includes("loft") || text.includes("luxury") || text.includes("villa")) amenities.push("AC");
  if (text.includes("cottage") || text.includes("villa") || text.includes("house") || text.includes("chalet")) amenities.push("Parking");

  const geometry = obj.geometry || {
    type: "Point",
    coordinates: [77.2090, 28.6139]
  };

  return {
    ...obj,
    category: obj.category || category,
    propertyType: obj.propertyType || propertyType,
    amenities: obj.amenities && obj.amenities.length > 0 ? obj.amenities : amenities,
    geometry
  };
};

const initDB = async () => {
  await Listing.deleteMany({});

  const ownerId = new mongoose.Types.ObjectId("6a92f82d30ab21081120b3b3");
  const listingsWithOwner = initData.data.map((obj) => ({
    ...enrichListing(obj),
    owner: ownerId,
  }));

  await Listing.insertMany(listingsWithOwner);
  console.log("data was initialized");
};

initDB();