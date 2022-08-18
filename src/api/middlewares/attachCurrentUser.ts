import { IattachCurrentUserRequest } from "../../interfaces/IRequest";
import logger from "../../loaders/logger";
import User from "../../models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "../../services/utils/jwtUtils"
//현재 사용하는 유저를 req객체에 추가

const attachCurrentUser = async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
    try {
        const getToken = (req: IattachCurrentUserRequest) => {
            const token = req.headers.cookie?.split('=')[1];
            return typeof token === 'string' ? token : undefined
        };

        if(!getToken(req)){
            throw new Error('No Token');
        };

        const verifyToken = jwt.prototype.verifyToken(getToken(req));
        
        const userRecord = await User.findById(verifyToken['_id']);
        if (!userRecord) {
            throw new Error('Invalid User Id')
        };
        
        const currentUser:Object = { ...userRecord['_doc'] };
        const deleteTargetArr = ['password', 'createdAt', 'updatedAt', '__v']
       
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