import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import logger from "@/loaders/logger";
import { createUser } from "@/services/user/user.factory";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import DiaryService from "@/services/diary/diary.service";
import { createDiaryInstance } from "@/services/diary/diary.factory";
import UserService from "@/services/user/user.service";

const route = Router();

export default (app: Router) => {
    app.use('/user', attachCurrentUser, route);
   
    route.get('/me', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const userServiceInstance = createUser()
        const {id, email} = await userServiceInstance.findById(userId);
        return res.status(200).json({id, email});
    });

    route.patch('/', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        const passwordObj = req.body
        const userServiceInstance = createUser();
        
        const result = await userServiceInstance.editUser(userId, passwordObj);
        return res.status(200).json(result);
    });
    
    route.delete('/', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        const password: string = req.body.password
        const userServiceInstance = createUser();
        const diaryServiceInstance = createDiaryInstance()
        const userDeleteSequence = async (userServiceInstance: UserService, diaryServiceInstance: DiaryService) => {
            try {
                const diaryDelete = await diaryServiceInstance.deleteAllDiary(userId)
                const result = await userServiceInstance.deleteUser(userId, password);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({message:'Server Error'})
            }
        };
        
        userDeleteSequence(userServiceInstance, diaryServiceInstance);
    });
};