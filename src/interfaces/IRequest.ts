import { Request } from "express";

export interface IattachCurrentUserRequest extends Request{
    token:any;
    currentUser:any;
};