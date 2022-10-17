import { UserBase as UserInputDTO } from '@/interfaces/User';
import { celebrate, Joi } from 'celebrate';
import { CookieOptions, NextFunction, Request, Response, Router } from 'express';
import logger from '@/loaders/logger';
import { createUserInstance } from '@/services/user/user.factory';
import { createAuthInstance } from '@/services/auth/auth.factory';
import { signupType } from '@/models/user';
import { createMailInstance } from '@/services/mail/mail.factory';


const route = Router();

//이거 적용하면 swagger도 바꿔야함
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
  *                       $ref: '#/components/schemas/User/properties/id/example'
  *                  email:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/email/example'
  *                  type:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/type/example'
  *        "400":
  *          description: 잘못된 파라미터 전달
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
        const {user} = await userServiceInstance.signup(req.body as UserInputDTO);
        
        return res.status(201).json(user);
      } catch (error) {
        logger.error('error: %o', error);
        const errorMessage = error.message;

        const badParametorErr = ["Bad email parametor", "Bad password parametor"]
        if (badParametorErr.includes(errorMessage)) {
          error.status = 400;
          error.message = '잘못된 파라미터 값입니다.'
          return next(error);
        };
        if (errorMessage === "Email Already Exists") {
          error.status = 409;
          error.message = '이미 가입된 이메일입니다.'
          return next(error);
        };
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
  *                       $ref: '#/components/schemas/User/properties/id/example'
  *                  email:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/email/example'
  *                  type:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/type/example'
  *          headers:
  *            Set-cookie:
  *              description: cookie에 jwt저장
  *              schema:
  *                type: string
  *                example: 'jwt=asd123.zxc456.qwe789; Path=/'
  *        "400":
  *          description: 잘못된 파라미터 전달 또는 잘못된 비밀번호 입력
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
        const badParametorErr = ["Bad email parametor", "Bad password parametor"]
        if (badParametorErr.includes(errorMessage)) {
          error.status = 400;
          error.message = '잘못된 파라미터 값입니다.'
          return next(error);
        };
        if (errorMessage === 'Invalid Password') {
          error.status = 400;
          error.message = '잘못된 비밀번호입니다.'
          return next(error);
        };
        
        if (errorMessage === 'User not registered') {
          error.status = 404;
          error.message = '등록된 유저가 없습니다.'
          return next(error);
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
  *      summary: 본인인증 링크를 유저 메일로 전송.
  *      tags: [Auth]
  *      requestBody:
  *        description: 접속하기 원하는 이메일
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
  *          description: 유저 이메일에 인증링크를 보냄
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  message:
  *                    type: string
  *                    description: 인증링크 보냈음을 안내
  *                    example: '등록된 이메일로 인증코드를 보냈습니다.'
  *        "404":
  *          description: 해당하는 유저가 없음
  *        "500":
  *          description: 서버 에러
  */  
  route.post(
    '/findPassword',
   celebrate({
      body: Joi.object({
        email: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Login endpoint with body: %o', req.body);
      try {
        const email = req.body.email;
        const userServiceInstance = createUserInstance();
        const mailServiceInstance = createMailInstance();
        const {email: userEmail} = await userServiceInstance.findUserByEmail(email);
        const verifyCode = mailServiceInstance.createVerifyCode();
        const saveCode = await mailServiceInstance.saveValidCode(userEmail, verifyCode)
        const sendVerifyEmail = await mailServiceInstance.sendUserValidEmail(userEmail, verifyCode);
      
        return res.status(200).json({ message: '등록된 이메일로 인증코드를 보냈습니다' });
      } catch (error) {
        logger.error('error: %o', error);
        const errorMessage = error.message;

        if (errorMessage === 'User not registered') {
          error.status = 404;
          error.message = '등록된 유저가 없습니다.'
          return next(error);
        };
        return next(error);
      }
    },
  );

   /**
  * @swagger
  * paths:
  *  /auth/verify/code:
  *    get:
  *      summary: 임시비밀번호를 유저 메일로 전송.
  *      tags: [Auth]
  *      parameters:
  *      - in: 'query'
  *        name: 'code'
  *        description: '유저 본인확인용 코드'
  *        required: true
  *        schema:
  *          type: string
  *          example: 'z52q898f6a8x844c'
  *      responses:
  *        "200":
  *          description: 가입한 이메일로 임시 비밀번호 전송
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  message:
  *                    type: string
  *                    description: 확인 메시지
  *                    example: '이메일로 임시 비밀번호를 전송했습니다.'
  *        "404":
  *          description: 해당하는 유저가 없음
  *        "500":
  *          description: 서버 에러
  */  
  route.get('/verify/code', //code를 받는데서부터
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Login endpoint with body: %o', req.body);
      try {
        // auth/verify/code?code=XXXX
        const code = req.query?.code ? String(req.query.code) : '';
        const mailServiceInstance = createMailInstance();
        const userServiceInstance = createUserInstance();
        const {email} = await mailServiceInstance.emailValidCheck(code); //이메일이 있다 OR 없다
        const {id: userId} = await userServiceInstance.findUserByEmail(email);
        const tempPassword = await userServiceInstance.changeTempPassword(userId);
        const result = await mailServiceInstance.sendTempPassword(email, tempPassword);
        
        return res.status(200).json({...result})
      } catch (error) {
        return next(error);
      }
    }
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
  *                       $ref: '#/components/schemas/User/properties/id/example'
  *                  email:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/email/example'
  *                  type:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/type/example'
  *          headers:
  *            Set-cookie:
  *              description: cookie에 jwt저장
  *              schema:
  *                type: string
  *                example: 'jwt=asd123.zxc456.qwe789; Path=/'
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
  *                       $ref: '#/components/schemas/User/properties/id/example'
  *                  email:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/email/example'
  *                  type:
  *                    type: string
  *                    example:  
  *                       $ref: '#/components/schemas/User/properties/type/example'
  *          headers:
  *            Set-cookie:
  *              description: cookie에 jwt저장
  *              schema:
  *                type: string
  *                example: 'jwt=asd123.zxc456.qwe789; Path=/'
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
