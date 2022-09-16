import { Logger } from 'winston';
import axios from 'axios';
import config from '../../config'; //@로 표기했었음. jest오류
import JwtUtil from '../utils/jwtUtils';
interface IOAuthResult {
  email: string;
  password: string;
  type: string;
}
export default class AuthService {
  logger: Logger;
  jwt: JwtUtil;
  //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
  constructor(logger: Logger, jwt: JwtUtil) {
    this.logger = logger;
    this.jwt = jwt;
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

        if (!kakaoToken) {
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
        if (!getUserInfo) {
          throw new Error('Kakao OAuth get user info fail')
        }

        const userInfo = getUserInfo.data

        //소셜로그인 시 사용자가 이메일 동의에 거부할 경우를 대비.
        const kakaoDataForm = {
          email: userInfo.email ? userInfo.email : this.createRandomId(),
          password: userInfo.id,
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
        if (!getUserInfo) {
          throw new Error('Google OAuth get user info fail')
        }
        const userInfo = getUserInfo.data

        const googleDataForm = {
          email: userInfo.email ? userInfo.email : this.createRandomId(),
          password: userInfo.id,
          type: 'google'
        };

        return googleDataForm;
      }
      const googleUserInfo = await getGoogleUserInfo()
      return googleUserInfo;
    } catch (error) {
      return error
    }

  }

  //이걸로 만든 아이디면 중복해결 해야함. 중복이면 다시 만들기.
  private createRandomId() {
    const randomNum = Math.round(Math.random() * 100000000)
    return '사용자' + randomNum
  }
}
