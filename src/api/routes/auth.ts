import { IUserInputDTO } from "@/interfaces/IUser";
import AuthService from "@/services/user";
import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import { Logger } from "winston";
import User from '@/models/user'
import logger from "@/loaders/logger";


const route = Router();

export default (app:Router) => {
    app.use('/auth', route)
    
    route.post('/signup',
    // api prefix로 인해 /api/auth/signup로 들어감. api접두사 없애려면 config 설정에서.
        celebrate({
            body:Joi.object({
                email:Joi.string().required(),
                password:Joi.string().required()
            })
        }),
        async (req:Request, res:Response, next:NextFunction) => {
            //typedi를 통해 의존성 주입
            //const logger:Logger = Container.get('logger'); //Container는 typedi
            logger.debug('Calling Sign-Up endpoint with body: %o', req.body );
            try {
                const userModel = new User;
                //const authServiceInstance = Conrainer.get(AuthService);
                const authServiceInstance = new AuthService(userModel, logger) //이거 팩토리로 못만드나?
                const {user, token} = await authServiceInstance.Signup(req.body as IUserInputDTO);
                return res.status(200).json({user, token})
            } catch (err) {
                logger.error('error: %o',err);
                return next(err)
            }
        }
    );
    //login
    //logout
    //signout? userdelete?
}