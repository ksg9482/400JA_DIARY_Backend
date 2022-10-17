import { Mail } from '@/interfaces/Mail';
import { Schema, model } from 'mongoose';


/**
 * @swagger
 *  components:
 *    schemas:
 *      Mail:
 *        type: object
 *        required:
 *          - email
 *          - verifyCode
 *        properties:
 *          id:
 *            type: Objdct ID
 *            description: 자동 생성된 ID
 *            example: ObjectID('632db203145cddef30eced92')
 *          email:
 *            type: string
 *            format: email
 *            description: 유저 이메일
 *            example: example@email.com
 *          verifyCode:
 *            type: string
 *            description: 유저 인증용 코드
 *            example: '151a9omrd9as7d3asd111'
 *          createdAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 *          updatedAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 */
const mailSchema = new Schema<Mail>(
  {
    verifyCode: {
      type: String,
      require: true
    },
    email: {
      type: String,
      require: true
    }
  },
  {timestamps:true}
);

mailSchema.index({createdAt:1}, {expireAfterSeconds:180}); //3분

new Date().toISOString()
const Mail = model<Mail>('Mail', mailSchema);

export default Mail;
