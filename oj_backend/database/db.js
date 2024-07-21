import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DBConnection = async () => {
    const MONGODB_URL = process.env.MONGODB_URL;
    console.log("DB connection established")
    try {
        await mongoose.connect(MONGODB_URL, { useNewUrlParser: true });
    } catch (error) {
        console.log(error);
    }
};

export default DBConnection;