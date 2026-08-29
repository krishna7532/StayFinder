const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const listingSchema=new Schema({
    title : {
        type :String,
        required :true
    },
    description : String,
    image:{
        type:String,
        set:(v)=>v===""?"https://images.pexels.com/photos/28437165/pexels-photo-28437165.jpeg"
        :v,
         default:"https://images.pexels.com/photos/28437165/pexels-photo-28437165.jpeg",
    },
    price:Number,
    location:String,
    country:String,
    reviews : [{
        type : Schema.Types.ObjectId,
        ref :"Review"
    }],

});
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}})
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;