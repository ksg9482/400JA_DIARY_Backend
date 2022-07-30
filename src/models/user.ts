import { IUser } from "../interfaces/IUser";
import HashUtil from "../services/utils/hashUtils";
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

userSchema.pre('save', async function(next){
    if(this.password) {
        this.password = await HashUtil.prototype.hashPassword(this.password);
        next();
    };
});

userSchema.pre('updateOne', async function(next){
    if(this.password) {
        this.password = await HashUtil.prototype.hashPassword(this.password);
        next();
    };
});

const User = model<IUser>('User', userSchema);

export default User
//export default model<IUser>('User', userSchema);