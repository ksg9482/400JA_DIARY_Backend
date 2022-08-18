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
    userId:'text', 
    'content': 'text', 
    'year': 'text',
    'month': 'text',
    'day': 'text',
})

const Diary = model<IDiary>('Diary', diarySchema);

export default Diary