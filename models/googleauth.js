import mongoose from "mongoose";

const googleschema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    image: String
      
}, { timestamps: true });


const googledb = new mongoose.model("googleschema",googleschema);
export default googledb;