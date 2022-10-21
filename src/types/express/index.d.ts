import { Diary } from "@/interfaces/Diary";
import { User } from "@/interfaces/User";
import { Mail } from "@/interfaces/Mail";
import { Model } from "mongoose";

declare global {
    namespace Models {
        export type UserModel = Model<User>;
        export type DiaryModel = Model<Diary>;
        export type MailModel = Model<Mail>;
      }
}
