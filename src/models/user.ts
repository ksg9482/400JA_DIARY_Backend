import { IUser } from "@/interfaces/IUser";
import { Schema, model } from "mongoose";

const userSchema = new Schema<IUser>(
    {
        email: {
            type:String,
            require:true,
            index:true
        },
        password: {
            type:String,
            require:true
        },

        role: {
            type:String,
            require:true,
            default: 'user',
        }
    },
    {timestamps: true}
);

const User = model<IUser>('User', userSchema);

export default User
//export default model<IUser>('User', userSchema);