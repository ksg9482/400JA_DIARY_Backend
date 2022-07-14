import { IUser } from "@/interfaces/IUser";
import mongoose from "mongoose";

const User = new mongoose.Schema(
    {
        email: {
            type:String,
            require:true,
            index:true
        },
        password: String,

        salt: String,

        role: {
            type:String,
            default: 'user'
        }
    },
    {timestamps: true}
);

export default mongoose.model<IUser & mongoose.Document>('User', User);