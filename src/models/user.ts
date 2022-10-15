import { IUser } from '../interfaces/IUser';
import HashUtil from '../services/utils/hashUtils';
import { Schema, model } from 'mongoose';
export enum signupType {
  BASIC = 'BASIC',
  KAKAO = 'KAKAO',
  GOOGLE = 'GOOGLE'
};

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - email
 *          - password
 *          - role
 *          - type
 *        properties:
 *          _id:
 *            type: Objdct ID
 *            description: 자동 생성된 ID
 *            example: ObjectID('632db203145cddef30eced92')
 *          email:
 *            type: string
 *            format: email
 *            description: 유저 이메일
 *            example: example@email.com
 *          password:
 *            type: string
 *            description: 해시화 저장
 *            example: $2b$10$xzc2ShYNd2wfR2rO5Qj2wuhXqAolB7pPt2MEBI2Y6wfUOPa/mcniq
 *          role:
 *            type: string
 *            description: 유저 유형 구분
 *            example: user
 *            default: user
 *          type:
 *            type: string
 *            description: 유저 소셜 로그인 여부.
 *            example: BASIC
 *            enum:
 *              - BASIC
 *              - GOOGLE
 *              - KAKAO
 *            default: BASIC
 *          createdAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 *          updatedAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 */
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
