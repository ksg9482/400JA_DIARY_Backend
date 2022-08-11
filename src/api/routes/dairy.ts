import { Response, Router } from "express";
import { celebrate, Joi } from "celebrate";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import { createDiaryInstance } from "@/services/diary/diary.factory";

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
            content:Joi.string().required()
        })
    }),
    async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryContent = req.body
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.createDiaryContent(userId, diaryContent);
        return res.status(200).json(result);
    });
}