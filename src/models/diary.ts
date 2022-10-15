import { IDiary } from "@/interfaces/IDiary";
import { Schema, model } from "mongoose";

/**
 * @swagger
 *  components:
 *    schemas:
 *      Diary:
 *        type: object
 *        required:
 *          - userId
 *          - subject
 *          - content
 *          - year
 *          - month
 *          - day
 *        properties:
 *          _id:
 *            type: Objdct ID
 *            description: 자동 생성된 ID
 *            example: ObjectID('632db203145cddef30eced92')
 *          userId:
 *            type: string
 *            description: 작성자를 구분하기 위해 유저 아이디를 문자열로 저장.
 *            example: 632db203145cddef30eced92
 *          subject:
 *            type: string
 *            description: 다이어리 제목
 *            example: 처음으로 적어보는 일기 제목
 *            default: ""
 *          content:
 *            type: string
 *            description: 다이어리 본문
 *            example: 처음으로 적어보는 일기 내용
 *          year:
 *            type: Number
 *            description: 서버 기준. 다이어리 작성일의 년.
 *            example: 2022
 *          month:
 *            type: Number
 *            example: 10
 *            description: 서버 기준. 다이어리 작성일의 월.
 *          day:
 *            type: Number
 *            description: 서버 기준. 다이어리 작성일의 일.
 *            example: 1
 *          createdAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 *          updatedAt:
 *            type: Date
 *            description: 자동 생성된 타임 스탬프
 *            example: 2022-10-01 12:30:30
 */
const diarySchema = new Schema<IDiary>(
    {
        userId:{
            type:String,
            require:true,
        },
        subject: {
            type:String,
            default:"",
            require:true
        },
        content: {
            type:String,
            require:true
        },
        year: {
            type:Number,
            require:true
        },
        month: {
            type:Number,
            require:true
        },
        day: {
            type:Number,
            require:true
        },
    },
    {timestamps: true}
);

diarySchema.index({
    subject:'text',
    content:'text'
})

const Diary = model<IDiary>('Diary', diarySchema);

export default Diary