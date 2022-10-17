import { Request } from "express";

export interface AttachCurrentUserRequest extends Request{
    token:any;
    currentUser:any;
};