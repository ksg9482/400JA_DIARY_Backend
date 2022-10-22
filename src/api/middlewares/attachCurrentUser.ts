import { AttachCurrentUserRequest } from "@/interfaces/Request";
import logger from "@/loaders/logger";
import User from "@/models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "@/services/utils/jwtUtils"
//현재 사용하는 유저를 req객체에 추가

const attachCurrentUser = async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
    try {
        const getToken = (req: AttachCurrentUserRequest) => {
            const token = req.headers.cookie?.split('=')[1];
            return typeof token === 'string' ? token : undefined
        };

        if(!getToken(req)){
            throw new Error('No Token');
        };

        const verifyToken = jwt.prototype.verifyToken(getToken(req));
        
        const userRecord = await User.findById(verifyToken['id']);
        
        if (!userRecord) {
            throw new Error('AttachCurrentUser error');
        };
        
        const currentUser:Object = { ...userRecord['_doc'], id:userRecord['_doc']['_id'] };
        const deleteTargetArr = ['password', 'createdAt', 'updatedAt', '__v'];
       
        deleteTargetArr.forEach((target)=>{
            Reflect.deleteProperty(currentUser, target);
        })
        
        req.currentUser = currentUser;
        return next();
    } catch (error) {
        logger.error('Error attaching user to req: %o', error);
        return next(error);
    }
};

export default attachCurrentUser;