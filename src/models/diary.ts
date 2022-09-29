import { IDiary } from "@/interfaces/IDiary";
import { Schema, model } from "mongoose";

// const diaryContent = {
//     content: {
//         type:String,
//         require:true
//     },
//     createAt: {
//         type:Date,
//         require:true
//     },
// };

const diarySchema = new Schema<IDiary>(
    {
        userId:{
            type:String,
            require:true,
        },
        subject: {
            type:String,
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

diarySchema.pre('updateOne', async function (next) {
    console.log(this)
    // if (this.password) {
    //   this.password = await HashUtil.prototype.hashPassword(this.password);
    //   
    // }
    next();
  });

const Diary = model<IDiary>('Diary', diarySchema);

export default Diary