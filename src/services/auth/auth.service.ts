import { Logger } from 'winston';
import axios from 'axios';
import config from '@/config'; //@로 표기했었음. jest오류
import JwtUtil from '@/services/utils/jwtUtils';
import CommonUtils from '@/services/utils/commonUtils';
interface IOAuthResult {
  email: string;
  password: string;
  type?: string;
};
interface BaseOauthUserData {
  id: string;
};
interface KakaoUserData extends BaseOauthUserData {
  email?: string;
};
interface GoogleUserData extends BaseOauthUserData {
  email: string;
};
export default class AuthService {
  logger: Logger;
  jwt: JwtUtil;
  common: CommonUtils;
  //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
  constructor(logger: Logger, jwt: JwtUtil, common: CommonUtils) {
    this.logger = logger;
    this.jwt = jwt;
    this.common = common;
  }

  public async kakaoOAuth(code: string): Promise<IOAuthResult> {
    const kakaoHost = 'https://kauth.kakao.com';
    const kakaoParametor = {
      clientid: config.KAKAO_REST_API_KEY,
      redirect_uri: config.KAKAO_REDIRECT_URI,
    };

    const getKakaoAccessToken = async (kakaoHost: string, kakaoParametor: { clientid: string, redirect_uri: string }, code: string) => {
      const kakaoToken = await axios.post(
        `${kakaoHost}/oauth/token?grant_type=authorization_code`
        + `&clientid=${kakaoParametor.clientid}`
        + `&redirect_uri=${kakaoParametor.redirect_uri}`
        + `&code=${code}`,
      );
      if (!kakaoToken.data.access_token) {
        throw new Error('Kakao OAuth get Access token fail');
      };
      return kakaoToken.data.access_token;
    };

    const getKakaoUserData = async (accessToken: string): Promise<KakaoUserData> => {
      const getUserInfo = await axios.get(
        // access token로 유저정보 요청
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!getUserInfo.data) {
        throw new Error('Kakao OAuth get user info fail');
      }
      return getUserInfo.data;
    };

    const setKakaoUserForm = (userData: KakaoUserData): IOAuthResult => {
      const userForm = {
        email: userData.email ? userData.email : '사용자' + userData.id,
        password: String(userData.id),
        type: 'kakao'
      };
      return userForm;
    };

    const kakaoAccessToken = await getKakaoAccessToken(kakaoHost, kakaoParametor, code);
    const kakaoUserData = await getKakaoUserData(kakaoAccessToken);
    const kakaoUser = setKakaoUserForm(kakaoUserData);

    return kakaoUser;
  };

  public async googleOAuth(accessToken: string): Promise<IOAuthResult> {
    const getGoogleUserData = async (accessToken: string) => {
      const getUserInfo = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo`
        + `?access_token=${accessToken}`
      );
      if (!getUserInfo.data) {
        throw new Error('Google OAuth get user info fail')
      }
      return getUserInfo.data;
    };

    const setGoogleUserForm = (userData: GoogleUserData): IOAuthResult => {
      const userForm = {
        email: userData.email,
        password: userData.id,
        type: 'google'
      };
      return userForm;
    };

    const googleUserInfo = await getGoogleUserData(accessToken);
    const googleUser = setGoogleUserForm(googleUserInfo);

    return googleUser;
  };
};
