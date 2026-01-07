import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";
import { User } from "../models/user.models.js";



const connectDB = async () => {
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
       //create a default admin user if not exists
        const adminExists = await User.findOne({ name: "testadmin" });
        if (!adminExists) {
            const adminUser = new User({
                name: "testadmin",
                password: "admin123",
                email: "testadmin@test.com",
                role: "admin"
            });
            await adminUser.save();
        }
    } catch (error) {
        console.error("MONGODB Connection ERROR: ", error);
        process.exit(1);
    }
}

export default connectDB;