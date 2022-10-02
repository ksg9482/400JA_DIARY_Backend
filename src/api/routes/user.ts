import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import { createUserInstance } from "../../services/user/user.factory";
import { IattachCurrentUserRequest } from "../../interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import DiaryService from "../../services/diary/diary.service";
import { createDiaryInstance } from "../../services/diary/diary.factory";
import UserService from "../../services/user/user.service";

const route = Router();

export default (app: Router) => {
    app.use('/user', attachCurrentUser, route);
   
    route.get('/me', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const userServiceInstance = createUserInstance();
        const diaryServiceInstance = createDiaryInstance();
        const {id, email, type} = await userServiceInstance.findById(userId);
        const {count:diaryCount} = await diaryServiceInstance.findDiaryCount(userId);
        return res.status(200).json({id, email, type, diaryCount});
    });
    route.post('/valid',
    celebrate({
        body:Joi.object({
            password:Joi.string().required(),
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        const password: string = req.body.password;

        const userServiceInstance = createUserInstance();
        const passwordValid = await userServiceInstance.passwordValid(userId, password);
        if(passwordValid !== true) {
            return res.status(200).json({message:'Invalid password'});
        }
        
        return res.status(200).json(true);
    }
    )
    route.delete('/', 
    async (req: IattachCurrentUserRequest, res: Response) => {
        //body 안보냄. 비번체크, 유저삭제로 분리해야 함
        const userId: string = req.currentUser._id;
        const userServiceInstance = createUserInstance();
        const diaryServiceInstance = createDiaryInstance();
        
        const userDeleteSequence = async (userServiceInstance: UserService, diaryServiceInstance: DiaryService) => {
            try {
                const diaryDelete = await diaryServiceInstance.deleteAllDiary(userId)
                const result = await userServiceInstance.deleteUser(userId);
                return res.clearCookie('jwt').json('delete');
            } catch (error) {
                return res.status(500).json({message:'Server Error'})
            }
        };
        
        userDeleteSequence(userServiceInstance, diaryServiceInstance);
    });

    route.patch('/password',
    celebrate({
        body:Joi.object({
            password:Joi.string().required(),
            passwordChange:Joi.string().required(),
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        const {password, passwordChange} = req.body;
        const userServiceInstance = createUserInstance();
        const passwordValid = await userServiceInstance.passwordValid(userId, password);
        if(passwordValid !== true) {
            return res.status(201).json({message:'Invalid password'});
        }
        const result = await userServiceInstance.passwordChange(userId, passwordChange);
        return res.status(200).json(result);
    }
    )

    route.get('/logout', async(req: IattachCurrentUserRequest, res: Response) => {
        return res.clearCookie('jwt').json({message:'logout'})
    })
};