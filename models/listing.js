const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const CATEGORIES = ["Beach", "Mountains", "City", "Countryside", "Luxury", "Other"];
const PROPERTY_TYPES = ["Room", "Apartment", "House", "Villa", "Hotel", "Other"];
const AMENITIES = ["Pool", "Pet Friendly", "WiFi", "Parking", "AC", "Kitchen", "TV"];

const listingSchema=new Schema({
    title : {
        type :String,
        required :true
    },
    description : String,
    image:{
        url :String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    category: {
        type: String,
        enum: CATEGORIES,
        default: "Other",
        trim: true,
    },
    propertyType: {
        type: String,
        enum: PROPERTY_TYPES,
        default: "Other",
        trim: true,
    },
    amenities: [
        {
            type: String,
            enum: AMENITIES,
            trim: true,
        },
    ],
    reviews : [{
        type : Schema.Types.ObjectId,
        ref :"Review"
    }],
    owner :{
        type :Schema.Types.ObjectId,
        ref :"User"
    },

geometry :{
    type :{
        type :String,
        enum :["Point"],
        required :true
    },
  coordinates :{
    type :[Number],
    required :true
  }
}
}, { timestamps: true });

// Database indexing for search and filter performance
listingSchema.index({ location: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ propertyType: 1 });

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}})
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
module.exports.CATEGORIES = CATEGORIES;
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.AMENITIES = AMENITIES;
