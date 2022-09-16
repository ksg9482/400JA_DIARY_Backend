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
    next();
  }
});

userSchema.pre('updateOne', async function (next) {
  if (this.password) {
    this.password = await HashUtil.prototype.hashPassword(this.password);
    next();
  }
});

// userSchema.statics.findOneOrCreate = function findOneOrCreate(condition, doc) {
//   const self = this;
//   const newDocument = doc;
//   return new Promise((resolve, reject) => {
//     return self.findOne(condition)
//       .then((result) => {
//         if (result) {
//           return resolve(result);
//         }
//         return self.create(newDocument)
//           .then((result) => {
//             return resolve(result);
//           }).catch((error) => {
//             return reject(error);
//           })
//       }).catch((error) => {
//         return reject(error);
//       })
//   });
// }

const User = model<IUser>('User', userSchema);

export default User;
//export default model<IUser>('User', userSchema);
