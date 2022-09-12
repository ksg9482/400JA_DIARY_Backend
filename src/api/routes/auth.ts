import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { celebrate, Joi } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import logger from '../../loaders/logger';
import { createUserInstance } from '../../services/user/user.factory';
import { createAuthInstance } from '../../services/auth/auth.factory';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

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
        const { user, token } = await userServiceInstance.signup(req.body as IUserInputDTO);
        return res.status(200).json({ user, token });
      } catch (err) {
        logger.error('error: %o', err);
        return next(err);
      }
    },
  );

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

      try {
        const userServiceInstance = createUserInstance();
        const { user, token } = await userServiceInstance.login(req.body as IUserInputDTO);

        return res.status(200).cookie('jwt', token).json({ user });
      } catch (err) {
        logger.error('error: %o', err);
        return next(err);
      }
    },
  );

  route.get('/kakao',
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug('Calling Login endpoint with body: %o', req.body);

      try {
        const code = req.query?.code ? String(req.query.code) : ''
        //클라이언트 단에서 전송한 코드로 카카오 인증 -> 유저 정보 리턴
        const authServiceInstance = createAuthInstance();
        const kakaoOAuth = await authServiceInstance.kakaoOAuth(code);
        //유저 정보로 db검색. 없으면 가입 후 로그인, 있으면 바로 로그인
        //그냥 로그인이 아니라 OAuth메서드(findOrCreate) 따로 만드는게 좋을 듯.
        const userServiceInstance = createUserInstance();
        const { user, token } = await userServiceInstance.login(req.body as IUserInputDTO);

        return res.status(200).cookie('jwt', token).json({ user });
      } catch (err) {
        logger.error('error: %o', err);
        return next(err);
      }
    },
  );


  //logout
  //signout? userdelete?
};
