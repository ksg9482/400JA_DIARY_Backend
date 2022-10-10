import { Logger } from 'winston';
import axios from 'axios';
import config from '../../config'; //@로 표기했었음. jest오류
import JwtUtil from '../utils/jwtUtils';
import CommonUtils from '../utils/commonUtils';
interface IOAuthResult {
  email: string;
  password: string;
  type?: string;
}
export default class AuthService {
  logger: Logger;
  jwt: JwtUtil;
  common: CommonUtils;
  //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
  constructor(logger: Logger, jwt: JwtUtil, common:CommonUtils) {
    this.logger = logger;
    this.jwt = jwt;
    this.common = common;
  }

  
  //로그인 데이터는 똑같아야 한다
  //토큰에 로그인유형 무엇인지 추가해야 한다
  //회원가입 시 소셜인지 일반인지 -> 데이터베이스도 변동
  public async kakaoOAuth(code: string):Promise<IOAuthResult> {
    const kakaoHost = 'kauth.kakao.com';
    const kakaoParametor = {
      client_id: config.KAKAO_REST_API_KEY,
      redirect_uri: config.KAKAO_REDIRECT_URI,
    };
    try {
      const getKakaoUserInfo = async () => {
        const kakaoToken = await axios.post(
          `https://${kakaoHost}/oauth/token?grant_type=authorization_code`
          + `&client_id=${kakaoParametor.client_id}`
          + `&redirect_uri=${kakaoParametor.redirect_uri}`
          + `&code=${code}`,
        );

        if (!kakaoToken.data.access_token) {
          throw new Error('Kakao OAuth Access token error')
        }

        const getUserInfo = await axios.get(
          // access token로 유저정보 요청
          'https://kapi.kakao.com/v2/user/me',
          {
            headers: {
              Authorization: `Bearer ${kakaoToken.data.access_token}`,
            },
          },
        );
        if (!getUserInfo.data) {
          throw new Error('Kakao OAuth get user info fail')
        }

        const userInfo = getUserInfo.data

        //소셜로그인 시 사용자가 이메일 동의에 거부할 경우를 대비.
        //아이디에 전송아이디를 넣고 그 아이디로 검색해야 해당하는 유저 나옴
        
        const kakaoDataForm = {
          email: !userInfo.email ? '사용자' + userInfo.id : userInfo.email,
          password: String(userInfo.id),
          type: 'kakao'
        };
        return kakaoDataForm;
      }

      const kakaoUserInfo = await getKakaoUserInfo();

      return kakaoUserInfo;
    } catch (error) {
      return error
    }

  }

  public async googleOAuth(accessToken: string):Promise<IOAuthResult> {
    try {
      const getGoogleUserInfo = async () => {
        const getUserInfo = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo`
          +`?access_token=${accessToken}`
        );
        if (!getUserInfo.data) {
          throw new Error('Google OAuth get user info fail')
        }
        const userInfo = getUserInfo.data

        const googleDataForm = {
          email: userInfo.email,
          password: userInfo.id,
          type: 'google'
        };
        
        return googleDataForm;
      }
      const googleUserInfo = await getGoogleUserInfo();
      return googleUserInfo;
    } catch (error) {
      return error
    };
  };

}
