import mongoose, { Mongoose }  from "mongoose";   
import dotenv from "dotenv";
dotenv.config();
const MONGO_URL = "mongodb+srv://nhatnguyentk2:thanhnhattk@cluster0.ejwks8o.mongodb.net/Chat_app?retryWrites=true&w=majority";

const connect = async () => {
    try {
        let connecting = await mongoose.connect(MONGO_URL)
        console.log("Connect to database success")
        return connecting
    } catch (error) {
        console.log(error)
    }
}

export default connect;