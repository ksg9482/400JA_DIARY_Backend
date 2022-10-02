import { IUser } from '../interfaces/IUser';
import HashUtil from '../services/utils/hashUtils';
import { Schema, model, Document } from 'mongoose';
export enum signupType {
  BASIC = 'BASIC',
  KAKAO = 'KAKAO',
  GOOGLE = 'GOOGLE',
}
// interface IUserDocument extends IUser {
//   findOneOrCreate:(condition:any, doc:any) => Promise<any>
// }
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      require: true,
      index: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
      default: 'user',
    },
    type: {
      type: String,
      enum: signupType,
      require: true,
      default: signupType.BASIC,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (this.password) {
    this.password = await HashUtil.prototype.hashPassword(this.password);
  }
  next();
});





const User = model<IUser>('User', userSchema);

export default User;
