import { IDiary } from "@/interfaces/IDiary";
import { IUser } from "@/interfaces/IUser";
// import { IDiary } from "@/interfaces/IDiary";
import { Model, HydratedDocument } from "mongoose";

//mongoose 모델 설정
declare global {
    namespace Models {
        export type UserModel = Model<IUser>;
        export type DiaryModel = Model<IDiary>;
      }
}
