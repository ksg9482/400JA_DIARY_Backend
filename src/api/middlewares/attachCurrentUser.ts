import { AttachCurrentUserRequest } from "@/interfaces/Request";
import logger from "@/loaders/logger";
import User from "@/models/user";
import { NextFunction, Response } from "express";
import jwt from "@/services/utils/jwtUtils"

const attachCurrentUser = async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
    enum AuthorizationType {
        Bearer = 'Bearer'
    }
    
    
    const getToken = (req: AttachCurrentUserRequest) => {
        const authorization = req.headers.authorization.split(' ');
        const type = authorization[0];
        const accessToken = authorization[1];
        if(type === AuthorizationType.Bearer) {
            return accessToken;
        }
    };
    try {
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
        if(error.name === 'TokenExpiredError') {
            return res.status(403).json({error:"expire_token"})
        }
        
        logger.error('Error attaching user to req: %o', error);
        return next(error);
    }
};

export default attachCurrentUser;