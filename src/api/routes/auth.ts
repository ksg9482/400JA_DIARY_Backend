import { IUser, IUserInputDTO } from "@/interfaces/IUser";
import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import logger from "../../loaders/logger";
import { createUserInstance } from "../../services/user/user.factory";

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
            logger.debug('Calling Sign-Up endpoint with body: %o', req.body );
            try {
                const userServiceInstance = createUserInstance()
                const {user, token} = await userServiceInstance.signup(req.body as IUserInputDTO);
                return res.status(200).json({user, token})
            } catch (err) {
                logger.error('error: %o',err);
                return next(err)
            }
        }
    );

    route.post('/login',
    // api prefix로 인해 /api/auth/signup로 들어감. api접두사 없애려면 config 설정에서.
        celebrate({
            body:Joi.object({
                email:Joi.string().required(),
                password:Joi.string().required()
            })
        }),
        async (req:Request, res:Response, next:NextFunction) => {
            logger.debug('Calling Login endpoint with body: %o', req.body );
            
            try {
                const userServiceInstance = createUserInstance() 
                const {user, token} = await userServiceInstance.login(req.body as IUserInputDTO);
                
                return res.status(200).cookie('jwt',token).json({user})
            } catch (err) {
                logger.error('error: %o',err);
                return next(err)
            }
        }
    );

    //logout
    //signout? userdelete?
}

