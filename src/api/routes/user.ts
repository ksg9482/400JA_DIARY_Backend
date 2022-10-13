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
    /**
    * @swagger
    * tags:
    *   name: User
    *   description: 유저 정보 관리
    */
    app.use('/user', attachCurrentUser, route);

    /**
     * @swagger
     * paths:
     *  /user/me:
     *    get:
     *      summary: 유저 정보 획득
     *      tags: [User]
     *      responses:
     *        "200":
     *          description: 유저 정보 획득 성공
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  id:
     *                    type: string
     *                    example:  
     *                       $ref: '#/components/schemas/User/properties/_id/example'
     *                  email:
     *                    type: string
     *                    example:  
     *                       $ref: '#/components/schemas/User/properties/email/example'
     *                  type:
     *                    type: string
     *                    example:  
     *                       $ref: '#/components/schemas/User/properties/type/example'
     *                  diaryCount:
     *                    type: integer
     *                    example: 0
     *        "404":
     *          description: 해당하는 유저가 없음
     *        "500":
     *          description: 서버 에러
     */
    route.get('/me', async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.currentUser._id;

            const userServiceInstance = createUserInstance();
            const diaryServiceInstance = createDiaryInstance();

            const { id, email, type } = await userServiceInstance.findById(userId);
            const { count: diaryCount } = await diaryServiceInstance.findDiaryCount(userId);
            return res.status(200).json({ id, email, type, diaryCount });
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage === 'User not registered') {
                return res.status(404).json({ message: errorMessage });
            };
            return next(error);
        }
    });

    /**
    * @swagger
    * paths:
    *  /user/password:
    *    patch:
    *      summary: 비밀번호 변경
    *      tags: [User]
    *      requestBody:
    *        description: 평문 비밀번호와 변경하려는 비밀번호 전송
    *        content:
    *            application/json:
    *              schema:
    *                password:
    *                  type: string
    *                  example: 'a1!2@3#4$'
    *                passwordChange:
    *                  type: string
    *                  example: 'changea1!2@3#4$'
    *      responses:
    *        "200":
    *          description: 유저 비밀번호 변경 성공
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  message:
    *                    type: string
    *                    example: 'Password Changed'
    *        "400":
    *          description: 잘못된 비밀번호 입력
    *        "404":
    *          description: 해당하는 유저가 없음
    *        "500":
    *          description: 서버 에러
    */
    route.patch('/password',
        celebrate({
            body: Joi.object({
                password: Joi.string().required(),
                passwordChange: Joi.string().required(),
            })
        }),
        async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
            try {
                const userId: string = req.currentUser._id;
                const { password, passwordChange } = req.body;

                const userServiceInstance = createUserInstance();
                const passwordValid = await userServiceInstance.passwordValid(userId, password);

                const result = await userServiceInstance.passwordChange(userId, passwordChange);
                return res.status(200).json({ message: 'Password Changed' });
            } catch (error) {
                const errorMessage = error.message;
                if (errorMessage === 'Invalid Password') {
                    return res.status(400).json({ message: errorMessage });
                };
                if (errorMessage === 'User not registered') {
                    return res.status(404).json({ message: errorMessage });
                };
                return next(error);
            };
        }
    );

    /**
    * @swagger
    * paths:
    *  /user:
    *    delete:
    *      summary: 유저 정보 삭제
    *      tags: [User]
    *      responses:
    *        "200":
    *          description: 유저 정보 삭제 성공
    *          content:
    *            application/json:
    *              schema:
    *                type: string
    *                example: 'delete'
    *        "500":
    *          description: 서버 에러
    */
    route.delete('/',
        async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
            try {
                const userId: string = req.currentUser._id;

                const userServiceInstance = createUserInstance();
                const diaryServiceInstance = createDiaryInstance();

                const diaryDelete = await diaryServiceInstance.deleteAllDiary(userId)
                const result = await userServiceInstance.deleteUser(userId);
                
                return res.status(200).clearCookie('jwt').json('delete');
            } catch (error) {
                return next(error);
            }
        });

    /**
    * @swagger
    * paths:
    *  /user/valid:
    *    post:
    *      summary: 비밀번호 확인
    *      tags: [User]
    *      requestBody:
    *        description: 평문 비밀번호 전송
    *        content:
    *            application/json:
    *              schema:
    *                password:
    *                type: string
    *                example: 'a1!2@3#4$'
    *      responses:
    *        "200":
    *          description: 비밀번호가 해시화되어서 저장된 비밀번호와 동일함
    *          content:
    *            application/json:
    *              schema:
    *                type: boolean
    *        "400":
    *          description: 잘못된 비밀번호 입력
    *        "404":
    *          description: 해당하는 유저가 없음
    *        "500":
    *          description: 서버 에러
    */
    route.post('/valid',
        celebrate({
            body: Joi.object({
                password: Joi.string().required(),
            })
        }),
        async (req: IattachCurrentUserRequest, res: Response, next: NextFunction) => {
            try {
                const userId: string = req.currentUser._id;
                const password: string = req.body.password;

                const userServiceInstance = createUserInstance();

                const passwordValid = await userServiceInstance.passwordValid(userId, password);
                return res.status(200).json(true);
            } catch (error) {
                const errorMessage = error.message;
                if (errorMessage === 'Invalid Password') {
                    return res.status(400).json({ message: errorMessage });
                };
                if (errorMessage === 'User not registered') {
                    return res.status(404).json({ message: errorMessage });
                };
                return next(error);
            };
        }
    );

    /**
    * @swagger
    * paths:
    *  /user/logout:
    *    get:
    *      summary: 로그아웃
    *      tags: [User]
    *      responses:
    *        "200":
    *          description: 로그아웃
    *          content:
    *            application/json:
    *              schema:
    *                type: object
    *                properties:
    *                  message:
    *                    type: string
    *                    example: 'logout'
    */
    route.get('/logout', async (req: IattachCurrentUserRequest, res: Response) => {
        return res.clearCookie('jwt').json({ message: 'logout' })
    })
};