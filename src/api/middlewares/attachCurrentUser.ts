import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import logger from "@/loaders/logger";
import User from "@/models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "../../services/utils/jwtUtils"
//현재 사용하는 유저를 req객체에 추가

const attachCurrentUser = async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
    try {
        const verifyToken = jwt.prototype.verifyToken(req.token);
        //verifyToken._id 나오게 해야함
        const userRecord = User.findById(verifyToken);
        const currentUser = { ...userRecord['_doc'] };
        Reflect.deleteProperty(currentUser, 'password');
        req.currentUser = currentUser;
        if (!userRecord) {
            return res.sendStatus(401);
        };
        return next();
    } catch (error) {
        logger.error('Error attaching user to req: %o', error);
        return next(error);
    }
};

export default attachCurrentUser;