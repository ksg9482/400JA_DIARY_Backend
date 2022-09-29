import { celebrate, Joi } from "celebrate";
import { NextFunction, Request, Response, Router } from "express";
import { createUserInstance } from "../../services/user/user.factory";
import { IattachCurrentUserRequest } from "../../interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import DiaryService from "../../services/diary/diary.service";
import { createDiaryInstance } from "../../services/diary/diary.factory";
import UserService from "../../services/user/user.service";
import axios from "axios";
import config from "../../config";

const route = Router();

export default (app: Router) => {
    app.use('/user', attachCurrentUser, route);
   
    route.get('/me', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const userServiceInstance = createUserInstance();
        const diaryServiceInstance = createDiaryInstance();
        const {id, email, type} = await userServiceInstance.findById(userId);
        const diaryCount = await diaryServiceInstance.findDiaryCount(userId);
        return res.status(200).json({id, email, type, diaryCount});
    });

    //이거 결국 안쓰일듯. password 변경은 전용 메서드로 하는게 좋다고 생각.
    //이건 여러 시퀸스를 한번에 받음. 더 복잡?
    // route.patch('/', 
    // celebrate({
    //     body:Joi.object({
    //         password:Joi.string().required(),
    //         changePassword:Joi.string().required()
    //     })
    // }),
    // async (req: IattachCurrentUserRequest, res: Response) => {
    //     const userId: string = req.currentUser._id;
    //     const passwordObj = req.body
    //     const userServiceInstance = createUserInstance();
        
    //     const result = await userServiceInstance.editUser(userId, passwordObj);
    //     return res.status(200).json(result);
    // });

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