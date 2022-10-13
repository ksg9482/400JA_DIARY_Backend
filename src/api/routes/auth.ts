import { IUserInputDTO } from '../../interfaces/IUser';
import { celebrate, Joi } from 'celebrate';
import { CookieOptions, NextFunction, Request, Response, Router } from 'express';
import logger from '../../loaders/logger';
import { createUserInstance } from '../../services/user/user.factory';
import { createAuthInstance } from '../../services/auth/auth.factory';
import { signupType } from '../../models/user';


const route = Router();

const cookieOption: CookieOptions = {
  sameSite: 'none',
  domain: 'localhost',
  path: '/',
  secure: true,
  httpOnly: true,
};

export default (app: Router) => {
 /**
  * @swagger
  * tags:
  *   name: Auth
  *   description: 회원가입 및 로그인, 비밀번호 찾기
  */
  app.use('/auth', route);

 /**
  * @swagger
  * paths:
  *  /auth/signup:
  *    post:
  *      summary: 회원가입
  *      tags: [Auth]
  *      requestBody:
  *        description: 회원가입을 위한 이메일, 비밀번호 전송
  *        content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  email:
  *                    type: string
  *                    example: 
  *                      $ref: '#/components/schemas/User/properties/email/example'
  *                  password:
  *                    type: string
  *                    example: 'a1!2@3#4$'
  *      responses:
  *        "201":
  *          description: 회원가입 성공
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
  *        "409":
  *          description: 이미 해당 이메일로 가입되어 있음
  *        "500":
  *          description: 서버 에러
  */
  route.post(
    '/signup',
    // api prefix로 인해 /api/auth/signup로 들어감. api접두사 없애려면 config 설정에서.
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const userServiceInstance = createUserInstance();
        const {user} = await userServiceInstance.signup(req.body as IUserInputDTO);
        
        return res.status(201).json(user);
      } catch (error) {
        logger.error('error: %o', error);
        const errorMessage = error.message;
        if (errorMessage === "Email Already Exists") {
          return res.status(409).json({ error: errorMessage });
        }
        return next(error);
      }
    },
  );

 /**
  * @swagger
  * paths:
  *  /auth/login:
  *    post:
  *      summary: 로그인
  *      tags: [Auth]
  *      requestBody:
  *        description: 로그인을 위한 이메일, 비밀번호 전송
  *        content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  email:
  *                    type: string
  *                    example: 
  *                      $ref: '#/components/schemas/User/properties/email/example'
  *                  password:
  *                    type: string
  *                    example: 'a1!2@3#4$'
  *      responses:
  *        "200":
  *          description: 로그인 성공
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
  *        "400":
  *          description: 잘못된 파라미터 전달, 잘못된 비밀번호 입력
  *        "404":
  *          description: 해당하는 유저가 없음
  *        "500":
  *          description: 서버 에러
  */
  route.post(
    '/login',
    // api prefix로 인해 /api/auth/signup로 들어감. api접두사 없애려면 config 설정에서.
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Login endpoint with body: %o', req.body);
      const email = req.body.email;
      const password = req.body.password;
      try {
        const userServiceInstance = createUserInstance();
        const result = await userServiceInstance.login(email, password);


        return res.status(200).cookie('jwt', result.token).json({ user: result.user });
      } catch (error) {
        logger.error('error: %o', error);
        const errorMessage = error.message;
        if (errorMessage === "No login parametor") {
          return res.status(400).json({ error: errorMessage });
        };
        if (errorMessage === 'Invalid Password') {
          return res.status(400).json({ message: errorMessage });
        };
        if (errorMessage === 'User not registered') {
          return res.status(404).json({ message: errorMessage });
        };
        return next(error);
      }
    },
  );

 /**
  * @swagger
  * paths:
  *  /auth/findPassword:
  *    post:
  *      summary: 비밀번호를 분실했을 시 임시비밀번호 발급. 로직 변경 예정
  *      tags: [Auth]
  *      requestBody:
  *        description: 로그인을 위한 이메일, 비밀번호 전송
  *        content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  email:
  *                    type: string
  *                    example: 
  *                      $ref: '#/components/schemas/User/properties/email/example'
  *      responses:
  *        "200":
  *          description: 비밀번호 찾기 성공
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  tempPassword:
  *                    type: string
  *                    description: 랜덤생성한 번호 8자리 문자열
  *                    example: '15792257'
  *        "404":
  *          description: 해당하는 유저가 없음
  *        "500":
  *          description: 서버 에러
  */  
  route.post(
    '/findPassword',
    // api prefix로 인해 /api/auth/signup로 들어감. api접두사 없애려면 config 설정에서.
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Login endpoint with body: %o', req.body);
      try {
        //이거 로직 바꿔야 함
        //본인확인(이메일로) -> 확인되면 해당 이메일로 임시비밀번호 발급
        const email = req.body.email;
        const userServiceInstance = createUserInstance();
        const userCheck = await userServiceInstance.findUserByEmail(email);
        const tempPassword = await userServiceInstance.tempPassword(userCheck.id,);
        return res.status(200).json({ tempPassword: tempPassword });
      } catch (error) {
        logger.error('error: %o', error);
        const errorMessage = error.message;
        if (errorMessage === 'User not registered') {
          return res.status(404).json({ message: errorMessage });
        };
        return next(error);
      }
    },
  );

 /**
  * @swagger
  * paths:
  *  /auth/kakao:
  *    get:
  *      summary: kakao 소셜 로그인
  *      tags: [Auth]
  *      parameters:
  *      - in: 'query'
  *        name: 'code'
  *        description: '클라이언트에서 전송한 kakao 액세스 토큰 발급용 코드'
  *        required: true
  *        schema:
  *          type: string
  *          example: 'example_kakao_code'
  *      responses:
  *        "200":
  *          description: kakao 소셜 로그인 성공, cookie로 JWT전송
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
  *        "500":
  *          description: 서버 에러
  */
  route.get('/kakao',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const code = req.query?.code ? String(req.query.code) : ''
        //클라이언트 단에서 전송한 코드로 카카오 인증 -> 유저 정보 리턴
        const authServiceInstance = createAuthInstance();
        const kakaoOAuth = await authServiceInstance.kakaoOAuth(code);

        const userServiceInstance = createUserInstance();
        //password는 id를 패스워드 삼았다
        const { user, token } = await userServiceInstance.oauthLogin(kakaoOAuth.email, kakaoOAuth.password, signupType.KAKAO);

        return res.status(200).cookie('jwt', token).json({ user });
      } catch (err) {
        logger.error('error: %o', err);
        err.message = 'Kakao Oauth fail';
        return next(err);
      }
    },
  );

 /**
  * @swagger
  * paths:
  *  /auth/google:
  *    get:
  *      summary: google 소셜 로그인
  *      tags: [Auth]
  *      requestBody:
  *        description: google 소셜 로그인 액세스 코드 전송
  *        content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  accessToken:
  *                    type: string
  *                    example: 'exampleAccessCode'
  *      responses:
  *        "200":
  *          description: google 소셜 로그인 성공, cookie로 JWT전송
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
  *        "500":
  *          description: 서버 에러
  */
  route.post('/google',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { accessToken } = req.body;
        //클라이언트 단에서 전송한 코드로 카카오 인증 -> 유저 정보 리턴
        const authServiceInstance = createAuthInstance();
        const googleOAuth = await authServiceInstance.googleOAuth(accessToken);

        const userServiceInstance = createUserInstance();
        const { user, token } = await userServiceInstance.oauthLogin(googleOAuth.email, googleOAuth.password, signupType.GOOGLE);
        
        return res.status(200).cookie('jwt', token).json({ user });
      } catch (err) {
        logger.error('error: %o', err);
        err.message = 'Google Oauth fail';
        return next(err);
      }
    },
  );


};
