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
        const {id, email} = await userServiceInstance.findById(userId);
        const diaryCount = await diaryServiceInstance.findDiaryCount(userId);
        return res.status(200).json({id, email, diaryCount});
    });

    route.patch('/', 
    celebrate({
        body:Joi.object({
            password:Joi.string().required(),
            changePassword:Joi.string().required()
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        const passwordObj = req.body
        const userServiceInstance = createUserInstance();
        
        const result = await userServiceInstance.editUser(userId, passwordObj);
        return res.status(200).json(result);
    });

    route.post('/valid',
    celebrate({
        body:Joi.object({
            password:Joi.string().required(),
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId: string = req.currentUser._id;
        console.log(req.body)
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

    route.get('/logout', async(req: IattachCurrentUserRequest, res: Response) => {
        //oauth랑 일반로그인이랑 다름.
        // const oauthList = ['KAKAO', 'GOOGLE']
        // const userData = req.currentUser
        // if(oauthList.includes(userData.type)) {
        //     if(userData.type === 'KAKAO') {
        //         const kakaoLogout = await axios.get(`https://kauth.kakao.com/oauth/logout?client_id=${config.KAKAO_REST_API_KEY}&logout_redirect_uri=${config.KAKAO_REDIRECT_URI}`)
        //         console.log(kakaoLogout)
        //     }
        //     return res.clearCookie('jwt').json({message:'logout'})
        // } else {
        //     console.log('false')
        //     return res.clearCookie('jwt').json({message:'logout'})
        // }
        return res.clearCookie('jwt').json({message:'logout'})
    })
};