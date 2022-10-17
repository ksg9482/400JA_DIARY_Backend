import { Diary } from "@/interfaces/Diary";
import { User } from "@/interfaces/User";
import { Mail } from "@/interfaces/Mail";
import { Model } from "mongoose";

//mongoose 모델 설정
declare global {
    namespace Models {
        export type UserModel = Model<User>;
        export type DiaryModel = Model<Diary>;
        export type MailModel = Model<Mail>;
      }
}
