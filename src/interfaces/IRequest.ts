import { Request } from "express";

export interface IattachCurrentUserRequest extends Request{
    token:{
        _id:string;
    };
    currentUser:any
}