import { IUser } from "@/interfaces/IUser";
import { Model, HydratedDocument } from "mongoose";

//mongoose 모델 설정
declare global {
    namespace Models {
        export type UserModel = Model<IUser>;
      }
}
