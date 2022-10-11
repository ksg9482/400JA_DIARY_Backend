import config from "../../config";
import axios from "axios";
import logger from "../../loaders/logger";
import CommonUtils from "../utils/commonUtils";
import JwtUtil from "../utils/jwtUtils";
import AuthService from "./auth.service";

describe('UserService', () => {
    let service: AuthService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new AuthService(logger, new JwtUtil, new CommonUtils)
    })
    describe('kakaoOAuth', () => {
        const kakaoOAuthCode = 'kakaoCode'
        const kakaoHost = 'kauth.kakao.com';

        const kakaoParametor = {
            client_id: config.KAKAO_REST_API_KEY,
            redirect_uri: config.KAKAO_REDIRECT_URI,
        };

        const kakaoOuathURL = `https://${kakaoHost}/oauth/token?grant_type=authorization_code`
            + `&client_id=${kakaoParametor.client_id}`
            + `&redirect_uri=${kakaoParametor.redirect_uri}`
            + `&code=${kakaoOAuthCode}`;

        const accessToken = 'accessToken';

        it('kakaoOauth 기능에 오류가 있어 액세스 토큰이 발급되지 않으면 Kakao OAuth get Access token fail를 반환 한다.', async () => {
            try {
                axios.post = jest.fn().mockResolvedValue({ data: { access_token: null } })
                const result = await service.kakaoOAuth(kakaoOAuthCode);
            } catch (error) {
                expect(axios.post).toHaveBeenCalledTimes(1);
                expect(axios.post).toHaveBeenCalledWith(kakaoOuathURL);
                expect(error).toEqual(new Error('Kakao OAuth get Access token fail'));
            };
        });

        it('kakaoOauth 기능에 오류가 있어 유저정보를 받아오지 못하면 Kakao OAuth get user info fail를 반환 한다.', async () => {
            try {

                axios.post = jest.fn().mockResolvedValue({ data: { access_token: accessToken } })
                axios.get = jest.fn().mockResolvedValue({
                    data: null
                })
                const result = await service.kakaoOAuth(kakaoOAuthCode);

            } catch (error) {
                expect(axios.post).toHaveBeenCalledTimes(1);
                expect(axios.post).toHaveBeenCalledWith(kakaoOuathURL);
                expect(axios.get).toHaveBeenCalledTimes(1);
                expect(axios.get).toHaveBeenCalledWith('https://kapi.kakao.com/v2/user/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                expect(error).toEqual(new Error('Kakao OAuth get user info fail'));
            };
        });

        it('email이 제공되지 않으면 임시 아이디를 이메일로 삼아야 한다.', async () => {
            const axiosGetData = { email: '', id: 'kakaoId' };
            axios.post = jest.fn().mockResolvedValue({ data: { access_token: accessToken } })
            axios.get = jest.fn().mockResolvedValue({
                data: {...axiosGetData}
            })
            //CommonUtils.prototype.createRandomId = jest.fn().mockReturnValue('randomId')
            const result = await service.kakaoOAuth(kakaoOAuthCode);

            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith(kakaoOuathURL);
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            expect(result)
                .toEqual({
                    email: '사용자kakaoId', //사용자 + oauth에서 제공한 아이디 형식
                    password: 'kakaoId',
                    type: 'kakao'
                });
        });

        it('code를 입력하면 유저 form이 반환되어야 한다.', async () => {
            axios.post = jest.fn().mockResolvedValue({ data: { access_token: accessToken } })
            axios.get = jest.fn().mockResolvedValue({
                data: {
                    email: 'kakaoEmail',
                    id: 'kakaoId'
                }
            })

            const result = await service.kakaoOAuth(kakaoOAuthCode);

            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith(kakaoOuathURL);
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            expect(result)
                .toEqual({
                    email: 'kakaoEmail',
                    password: 'kakaoId',
                    type: 'kakao'
                });
        });

    });

    describe('googleOAuth', () => {
        const googleAccessToken = 'googleAccessToken'

        it('googleOAuth 기능에 오류가 있어 유저정보를 받아오지 못하면 Kakao OAuth get user info fail를 반환 한다.', async () => {
            try {
                axios.get = jest.fn().mockResolvedValue({
                    data: null
                })
                const result = await service.googleOAuth(googleAccessToken);

            } catch (error) {
                expect(axios.get).toHaveBeenCalledTimes(1);
                expect(axios.get).toHaveBeenCalledWith( `https://www.googleapis.com/oauth2/v1/userinfo`
                +`?access_token=${googleAccessToken}`);
                expect(error).toEqual(new Error('Google OAuth get user info fail'));
            };
        });

        it('code를 입력하면 유저 form이 반환되어야 한다.', async () => {
            axios.get = jest.fn().mockResolvedValue({
                data: {
                    email: 'googleEmail',
                    id: 'googleId'
                }
            })

            const result = await service.googleOAuth(googleAccessToken);

            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith( `https://www.googleapis.com/oauth2/v1/userinfo`
            +`?access_token=${googleAccessToken}`);
            expect(result)
                .toEqual({
                    email: 'googleEmail',
                    password: 'googleId',
                    type: 'google'
                });
        });
    });
});