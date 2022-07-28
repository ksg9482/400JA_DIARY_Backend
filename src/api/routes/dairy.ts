import { Response, Router } from "express";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import { createDiary } from "@/services/diary/diary.factory";

const route = Router();

export default (app:Router) => {
    app.use('/diary',attachCurrentUser, route)
    
    route.get('/all', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryServiceInstance = createDiary();
        const result = await diaryServiceInstance.findAllDiary(userId);
        return res.status(200).json(result);
    });

    route.post('/', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const diaryContent = req.body
        const diaryServiceInstance = createDiary();
        const result = await diaryServiceInstance.createDiaryContent(userId, diaryContent);
        return res.status(200).json(result);
    });
}