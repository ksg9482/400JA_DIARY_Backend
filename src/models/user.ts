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
  /*
  {
  _id: new ObjectId("633254b4cb9a8a2212da2595"),
  email: 'test@test.com',
  password: '123456',
  role: 'user',
  type: 'BASIC',
  createdAt: 2022-09-27T01:41:08.279Z,
  updatedAt: 2022-09-29T01:12:26.553Z,
  __v: 0
} 형식으로 나옴.
  */
  console.log(this)
  if (this.password) {
    this.password = await HashUtil.prototype.hashPassword(this.password);
  }
  next();
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
