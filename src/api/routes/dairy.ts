import { Response, Router } from "express";
import { celebrate, Joi } from "celebrate";
import { IattachCurrentUserRequest } from "../../interfaces/IRequest";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import { createDiaryInstance } from "../../services/diary/diary.factory";

const route = Router();

export default (app: Router) => {
    app.use('/diary', attachCurrentUser, route)

    route.post('/',
        celebrate({
            body: Joi.object({
                subject: Joi.string().max(30),
                content: Joi.string().max(400).required()
            })
        }),
        async (req: IattachCurrentUserRequest, res: Response) => {
            const userId = req.currentUser._id;
            const diaryContent = req.body
            const diaryServiceInstance = createDiaryInstance();
            const result = await diaryServiceInstance.createDiaryContent(userId, diaryContent);
            return res.status(200).json(result);
        });

    route.get('/', async (req: IattachCurrentUserRequest, res: Response) => {

        const userId = req.currentUser._id;
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.getDiary(userId);
        return res.status(200).json(result);
    });

    route.post('/nextdiary',
        celebrate({
            body: Joi.object({
                lastDiaryId: Joi.string()
            })
        }),
        async (req: IattachCurrentUserRequest, res: Response) => {
            const userId = req.currentUser._id;
            const lastDiaryId = req.body.lastDiaryId
            const diaryServiceInstance = createDiaryInstance();
            const result = await diaryServiceInstance.getLastIdDiary(userId, lastDiaryId);
            return res.status(200).json(result);
        });

    // route.get('/weekly', async (req: IattachCurrentUserRequest, res: Response) => {
    //     const userId = req.currentUser._id;
    //     const diaryServiceInstance = createDiaryInstance();
    //     const result = await diaryServiceInstance.weekleyDiary(userId)
    //     return res.status(200).json(result);
    // });


    // diary/search/keyword?keyword=XXXX
    route.get('/search/keyword', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        const keyword = req.query?.keyword ? String(req.query.keyword) : '';
        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.findKeyword(userId, keyword);
        return res.status(200).json(result);
    });

    // diary/search/date?date=2022-08-09
    route.get('/search/date', async (req: IattachCurrentUserRequest, res: Response) => {
        const userId = req.currentUser._id;
        //2022-08-09 형식
        const targetDate = req.query?.date ? String(req.query.date) : '';
        //split하고 객체 만드는 거 함수로 묶기

        const targetDateSplit = targetDate.split('-')
        const targetDateObj = {
            year: parseInt(targetDateSplit[0]),
            month: parseInt(targetDateSplit[1]),
            day: parseInt(targetDateSplit[2])
        };

        const diaryServiceInstance = createDiaryInstance();
        const result = await diaryServiceInstance.findByDate(userId, targetDate);
        return res.status(200).json(result);
    });


}