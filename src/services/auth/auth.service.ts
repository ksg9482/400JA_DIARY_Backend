import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston';
import axios from "axios";
import jwt from 'jsonwebtoken';
import config from '../../config'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';
import JwtUtil from '../utils/jwtUtils';

export default class AuthService {
  logger: Logger;
  jwt: JwtUtil
  //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
  constructor(logger: Logger, jwt:JwtUtil) {
    this.logger = logger;
    this.jwt = jwt
  }

  //로그인 데이터는 똑같아야 한다
  //토큰에 로그인유형 무엇인지 추가해야 한다
  //회원가입 시 소셜인지 일반인지 -> 데이터베이스도 변동
  public async kakaoOAuth(code: string) {
    const kakaoHost = 'kauth.kakao.com';
    const kakaoParametor = {
      client_id: config.KAKAO_REST_API_KEY,
      redirect_uri: config.KAKAO_REDIRECT_URI
    };
    
    console.log('이거 한번만 나와야 함')
    const kakaoToken = await axios.post(
        `https://${kakaoHost}/oauth/token?grant_type=authorization_code&client_id=${kakaoParametor.client_id}&redirect_uri=${kakaoParametor.redirect_uri}&code=${code}`
      )
    
    
    // const userInfo = await axios.get(
    //   // access token로 유저정보 요청
    //   'https://kapi.kakao.com/v2/user/me',
    //   {
    //     headers: {
    //       Authorization: `Bearer ${kakaoToken.data.access_token}`,
    //     },
    //   }
    // );
    const kakaoDataForm = {}
    return kakaoDataForm
    //클라이언트 키 받아서 카카오에 전송
    //토큰 받아서 jwt만들어 리턴
  };

  public async googleOAuth(code: string) {
    const googleHost = 'oauth2.googleapis.com'

    const googleToken = await axios.post(`https://${googleHost}/token?code=${code}&client_id=${config.GOOGLE_CLIENT_ID}&client_secret=${config.GOOGLE_CLIENT_SECRET}&redirect_uri=${config.GOOGLE_REDIRECT_URI}&grant_type=authorization_code`)

    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleToken.data.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${googleToken.data.access_token}`,
        },
      }
    );
    const userDataForm = {}
    return userDataForm
    //클라이언트 키 받아서 카카오에 전송
    //토큰 받아서 jwt만들어 리턴
  };

}
