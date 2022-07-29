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
            require:true
        },
        content:{
            type:String,
            require:true
        },
    },
    {timestamps: true}
);


const Diary = model<IDiary>('Diary', diarySchema);

export default Diary