import axios from "axios";
import logger from "../../loaders/logger";
import CommonUtils from "../utils/commonUtils";
import JwtUtil from "../utils/jwtUtils";
import AuthService from "./auth.service";
const mockRepository = () => (
    {
        save: jest.fn(),
        findone: jest.fn()
    }
);

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn()
});
//jest.mock('@/models/user')
//jest.mock('@/loaders/logger')
//jest.mock('./auth.service')
describe('UserService', () => {
    let service: AuthService;
    //let jwtService: JwtService;
    
    beforeEach(() => {
        service = new AuthService(logger, new JwtUtil, new CommonUtils)
    })
    describe('kakaoOAuth', () => {
        const kakaoOAuthCode = 'kakaoCode'

        it('kakaoOauth 기능에 오류가 있어 액세스 토큰이 발급되지 않으면 Kakao OAuth Access token error를 반환 한다.', async () => {
            try {
                axios.post = jest.fn().mockResolvedValue({ data: { access_token: null } })
                const result = await service.kakaoOAuth(kakaoOAuthCode);
            } catch (error) {
                expect(error).toEqual(new Error('Kakao OAuth Access token error'));
            };
        });
        it('kakaoOauth 기능에 오류가 있어 데이터가 전송되지 않으면 Kakao OAuth Access token error를 반환 한다.', async () => {
            try {
                axios.post = jest.fn().mockResolvedValue({ data: null })
                const result = await service.kakaoOAuth(kakaoOAuthCode);
            } catch (error) {
                expect(error).toEqual(new Error('Kakao OAuth Access token error'));
            };
        });

        it('kakaoOauth 기능에 오류가 있어 유저정보를 받아오지 못하면 Kakao OAuth get user info fail를 반환 한다.', async () => {
            try {
                axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'accessToken' } })
                axios.get = jest.fn().mockResolvedValue({
                    data: null
                })
                const result = await service.kakaoOAuth(kakaoOAuthCode);

            } catch (error) {
                expect(error).toEqual(new Error('Kakao OAuth get user info fail'));
            };
        });

        it('email이 제공되지 않으면 임시 아이디를 이메일로 삼아야 한다.', async () => {
            axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'accessToken' } })
            axios.get = jest.fn().mockResolvedValue({
                data: {
                    email: '',
                    id: 'kakaoId'
                }
            })
            //CommonUtils.prototype.createRandomId = jest.fn().mockReturnValue('randomId')
            const result = await service.kakaoOAuth(kakaoOAuthCode);

            expect(result)
                .toEqual({
                    email: '사용자kakaoId', //사용자 + oauth에서 제공한 아이디 형식
                    password: 'kakaoId',
                    type: 'kakao'
                });
        });

        it('code를 입력하면 유저 form이 반환되어야 한다.', async () => {
            axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'accessToken' } })
            axios.get = jest.fn().mockResolvedValue({
                data: {
                    email: 'kakaoEmail',
                    id: 'kakaoId'
                }
            })

            const result = await service.kakaoOAuth(kakaoOAuthCode);

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

            expect(result)
                .toEqual({
                    email: 'googleEmail',
                    password: 'googleId',
                    type: 'google'
                });
        });
    });
});