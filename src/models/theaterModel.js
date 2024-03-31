const mongoose =require( "mongoose")

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number },
  address:{type: String},
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
});

const Theater = mongoose.model("Theater", theaterSchema);
module.exports = Theater;
