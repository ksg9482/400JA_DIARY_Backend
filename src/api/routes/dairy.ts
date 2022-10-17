import { NextFunction, Response, Router } from "express";
import { celebrate, Joi } from "celebrate";
import { AttachCurrentUserRequest } from "@/interfaces/Request";
import attachCurrentUser from "@/api/middlewares/attachCurrentUser";
import { createDiaryInstance } from "@/services/diary/diary.factory";

const route = Router();

export default (app: Router) => {
    /**
     * @swagger
     * tags:
     *   name: Diary
     *   description: 다이어리 작성 및 검색
     */
    app.use('/diary', attachCurrentUser, route)

    /**
    * @swagger
    * paths:
    *  /diary:
    *    post:
    *      summary: 다이어리 작성
    *      tags: [Diary]
    *      requestBody:
    *        description: 다이어리 작성 및 당일자 수정을 위한 데이터
    *        content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  subject:
    *                    type: string
    *                    example: 
    *                      $ref: '#/components/schemas/Diary/properties/subject/example'
    *                  content:
    *                    type: string
    *                    example: 
    *                      $ref: '#/components/schemas/Diary/properties/content/example'
    *      responses:
    *        "201":
    *          description: 다이어리 작성(Diary save) 또는 갱신(Diary update) 성공
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  message:
    *                    type: string
    *        "400":
    *          description: 잘못된 파라미터 전달
    *        "500":
    *          description: 서버 에러
    */
    route.post('/',
        celebrate({
            body: Joi.object({
                subject: Joi.string().max(30),
                content: Joi.string().max(400).required()
            })
        }),
        async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
            try {
                const userId = req.currentUser.id;
                const diaryContent = req.body
                const diaryServiceInstance = createDiaryInstance();
                const result = await diaryServiceInstance.createDiaryContent(userId, diaryContent);
                return res.status(201).json(result);
            } catch (error) {
                const errorMessage = error.message;
                if (errorMessage === 'Bad userId parametor') {
                    return res.status(400).json({ message: errorMessage });
                };
                if (errorMessage === 'Bad Diary parametor') {
                    return res.status(400).json({ message: errorMessage });
                };
                return next(error);
            }

        });

    /**
    * @swagger
    * paths:
    *  /diary:
    *    get:
    *      summary: 가장 최근 작성된 다이어리를 기준으로 7일분 다이어리들 제공
    *      tags: [Diary]
    *      responses:
    *        "200":
    *          description: 마지막 다이어리 여부, 다이어리 리스트
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  end:
    *                    type: boolean
    *                  list:
    *                    type: array
    *                    items:
    *                      properties:
    *                        id: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/id/example'
    *                        subject: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/subject/example'
    *                        content: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/content/example'
    *                        date: 
    *                          type: string
    *                          example: '2022-10-01'
    *        "400":
    *          description: 잘못된 파라미터 전달
    *        "500":
    *          description: 서버 에러
    */
    route.get('/', async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.currentUser.id;
            const diaryServiceInstance = createDiaryInstance();
            const result = await diaryServiceInstance.getDiary(userId);
            return res.status(200).json(result);
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage === 'Bad userId parametor') {
                return res.status(400).json({ message: errorMessage });
            };
            return next(error);
        }

    });

    /**
    * @swagger
    * paths:
    *  /diary/nextdiary:
    *    post:
    *      summary: 제공된 ID에 해당하는 다이어리 이후 7일분 다이어리들 제공
    *      tags: [Diary]
    *      requestBody:
    *        description: 다이어리 ID에 해당하는 ObjectID() 내부 문자열.
    *        content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  lastDiaryId:
    *                    type: string
    *                    example: '6324653ada7d27d6685ef1bc'
    *      responses:
    *        "200":
    *          description: 마지막 다이어리 여부, 다이어리 리스트
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  end:
    *                    type: boolean
    *                  list:
    *                    type: array
    *                    items:
    *                      properties:
    *                        id: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/id/example'
    *                        subject: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/subject/example'
    *                        content: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/content/example'
    *                        date: 
    *                          type: string
    *                          example: '2022-10-01'
    *        "400":
    *          description: 잘못된 파라미터 전달
    *        "500":
    *          description: 서버 에러
    */
    route.post('/nextdiary',
        celebrate({
            body: Joi.object({
                lastDiaryId: Joi.string()
            })
        }),
        async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
            try {
                const userId = req.currentUser.id;
                const lastDiaryId = req.body.lastDiaryId
                const diaryServiceInstance = createDiaryInstance();
                const result = await diaryServiceInstance.getLastIdDiary(userId, lastDiaryId);
                return res.status(200).json(result);
            } catch (error) {
                const errorMessage = error.message;

                const badParametorErr = ["Bad userId parametor", "Bad lastDiaryId parametor"]
                if (badParametorErr.includes(errorMessage)) {
                  error.status = 400;
                  error.message = '잘못된 파라미터 값입니다.'
                  return next(error);
                };
                return next(error);
            };
        });

    /**
    * @swagger
    * paths:
    *  /diary/search/keyword:
    *    get:
    *      summary: 제목 또는 본문이 키워드에 해당하는 모든 다이어리를 제공
    *      tags: [Diary]
    *      parameters:
    *      - in: 'query'
    *        name: 'keyword'
    *        description: '복수 검색시에는 "키워드1"+"키워드2" 형식'
    *        required: true
    *        schema:
    *          type: string
    *          example: '원하는키워드'
    *      responses:
    *        "200":
    *          description: 마지막 다이어리 여부, 다이어리 리스트
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  end:
    *                    type: boolean
    *                  list:
    *                    type: array
    *                    items:
    *                      properties:
    *                        id: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/id/example'
    *                        subject: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/subject/example'
    *                        content: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/content/example'
    *                        date: 
    *                          type: string
    *                          example: '2022-10-01'
    *        "400":
    *          description: 잘못된 파라미터 전달
    *        "500":
    *          description: 서버 에러
    */
    route.get('/search/keyword', async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
        try {
            // diary/search/keyword?keyword=XXXX
            const userId = req.currentUser.id;
            const keyword = req.query?.keyword ? String(req.query.keyword) : '';
            const diaryServiceInstance = createDiaryInstance();
            const result = await diaryServiceInstance.findKeyword(userId, keyword);
            return res.status(200).json(result);
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage === 'Bad userId parametor') {
                return res.status(400).json({ message: errorMessage });
            };
            if (errorMessage === 'Bad keyword parametor') {
                return res.status(400).json({ message: errorMessage });
            };
            return next(error);
        }

    });

        /**
    * @swagger
    * paths:
    *  /diary/search/date:
    *    get:
    *      summary: 원하는 날짜를 기준으로 이전 날짜에 해당하는 모든 다이어리를 제공
    *      tags: [Diary]
    *      parameters:
    *      - in: 'query'
    *        name: 'date'
    *        description: '기준이 되는 날짜도 검색 결과에 포함'
    *        required: true
    *        schema:
    *          type: string
    *          example: '2022-10-01'
    *      responses:
    *        "200":
    *          description: 마지막 다이어리 여부, 다이어리 리스트
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  end:
    *                    type: boolean
    *                  list:
    *                    type: array
    *                    items:
    *                      properties:
    *                        id: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/id/example'
    *                        subject: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/subject/example'
    *                        content: 
    *                          type: string
    *                          example: 
    *                            $ref: '#/components/schemas/Diary/properties/content/example'
    *                        date: 
    *                          type: string
    *                          example: '2022-10-01'
    *        "400":
    *          description: 잘못된 파라미터 전달
    *        "500":
    *          description: 서버 에러
    */
    route.get('/search/date', async (req: AttachCurrentUserRequest, res: Response, next: NextFunction) => {
        try {
            // diary/search/date?date=2022-08-09
            const userId = req.currentUser.id;
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

        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage === 'Bad userId parametor') {
                return res.status(400).json({ message: errorMessage });
            };
            if (errorMessage === 'Bad targetDate parametor') {
                return res.status(400).json({ message: errorMessage });
            };
            return next(error);
        };
    });
};