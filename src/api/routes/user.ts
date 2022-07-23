import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import logger from "@/loaders/logger";
import { createUser } from "@/services/user/user.service";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";

const route = Router();

export default (app: Router) => {
    app.use('/user', route);

    route.get('/me', async (req: IattachCurrentUserRequest, res: Response) => {
        console.log(req.currentUser._id)
        const userServiceInstance = createUser()
        const {id, email} = await userServiceInstance.findById(req.currentUser);
        return res.status(200).json({id, email})
    });

    route.patch('/user', async (req: IattachCurrentUserRequest, res: Response) => {
        const userServiceInstance = createUser();
        const test = await userServiceInstance.editUser(req.currentUser._id);
        return res.status(200).json(test)
    });
    
    route.delete('/user', async (req: IattachCurrentUserRequest, res: Response) => {
        const userServiceInstance = createUser();
        const test = await userServiceInstance.deleteUser(req.currentUser._id);
        return res.status(200).json(test)
    });
};