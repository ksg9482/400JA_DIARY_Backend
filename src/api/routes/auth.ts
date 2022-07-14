import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import { Logger } from "winston";

const route = Router();

export default (app:Router) => {
    app.use('/auth', route)
    //signup
    route.post('signup',
        celebrate({
            body:Joi.object({
                name:Joi.string().required(),
                email:Joi.string().required(),
                password:Joi.string().required()
            })
        }),
        // async (req:Request, res:Response, next:NextFunction) => {
        //     //typedi를 통해 의존성 주입
        //     const logger:Logger = Container.get('logger'); //Container는 typedi
        //     logger.debug('Calling Sign-Up endpoint with body: %o', req.body );
        //     try {
        //         const authServiceInstance = Conrainer.get(AuthService);
        //         const {user, token} = await authServiceInstance.Signup(req.body as IUserInputDTO);
        //         return res.status(200).json({user, token})
        //     } catch (err) {
        //         logger.error('error: %o',err);
        //         return next(err)
        //     }
        // }
    );
    //login
    //logout
    //signout? userdelete?
}