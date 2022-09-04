import { Response, Router } from "express";
import { celebrate, Joi } from "celebrate";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import { createDiaryInstance } from "../../services/diary/diary.factory";

const route = Router();

export default (app:Router) => {
    app.use('/diary',attachCurrentUser, route)
    
    route.get('/all', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.findAllDiary(userId);
        return res.status(200).json(result);
    });

    route.post('/', 
    celebrate({
        body:Joi.object({
            subject:Joi.string().max(20),
            content:Joi.string().max(400).required()
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryContent = req.body
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.createDiaryContent(userId, diaryContent);
        return res.status(200).json(result);
    });

    route.get('/search', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const keyword = req.query?.keyword ? String(req.query.keyword) : '';
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.findKeyword(userId, keyword);
        return res.status(200).json(result);
    });
    //키워드 검색
    //날짜기준

    route.get('/weekly', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.weekleyDiary(userId)
        return res.status(200).json(result);
    });
}