import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import logger from "@/loaders/logger";
import { createUser } from "@/services/user/user.service";

const route = Router();

export default (app: Router) => {
    app.use('/users', route);

    route.get('/me', async (req: Request, res: Response) => {
        //req.body - id:number
        console.log(req.params)
        //current user 구현해야 함
        
        const userServiceInstance = createUser()
        const {id, email} = await userServiceInstance.findById(req.body);
        return res.status(200).json({id, email})
    });

    //유저정보 수정
    //유저 삭제
};