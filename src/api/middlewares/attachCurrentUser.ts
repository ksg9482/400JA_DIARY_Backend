import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import logger from "@/loaders/logger";
import User from "@/models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "../../services/utils/jwtUtils"
//현재 사용하는 유저를 req객체에 추가

const attachCurrentUser = async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
    try {
        const tokenSlug = req.headers.cookie?.split('=')[1]
        
        if(!req.headers.cookie){
            throw new Error('No Token')
        }
        const verifyToken = jwt.prototype.verifyToken(tokenSlug);
        
        const userRecord = await User.findById(verifyToken['_id']);
        if (!userRecord) {
            throw new Error('Invalid User Id')
        };
        
        const currentUser:Object = { ...userRecord['_doc'] };
        const deleteTargetArr = ['password', 'createdAt', 'updatedAt', '__v']
        for (const target of deleteTargetArr) {
            Reflect.deleteProperty(currentUser, target);
        }
        
        req.currentUser = currentUser;
        return next();
    } catch (error) {
        logger.error('Error attaching user to req: %o', error);
        return next(error);
    }
};

export default attachCurrentUser;