import AuthService from "./auth.service";
import User from '../../models/user'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import { Document } from "mongoose";
const mockRepository = () => (
    {
        save:jest.fn(),
        findone:jest.fn()
    }
);

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn()
});
//jest.mock('@/models/user')
//jest.mock('@/loaders/logger')
//jest.mock('./auth.service')
describe('AuthService',()=>{
    let service: AuthService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new AuthService(User, logger)
    })
    describe('signup',() => {
        const signupArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.Signup({ email: '',password: 'mock'});
            } catch (error) {
                expect(error).toEqual(new Error('No user parametor'));
            };
        });

        it('이미 등록된 email이라면 Already Email를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(signupArg)
                const result = await service.Signup(signupArg);
            } catch (error) {
                expect(error).toEqual(new Error('Already Email'));
            };
        });

        it('유저 생성에 실패하면 User cannot be created를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                HashUtil.hashPassword = jest.fn().mockResolvedValue(Promise.resolve('hassed Password'))
                jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({error:'DocumentNotFoundError'}))
                const result = await service.Signup(signupArg);
            } catch (error) {
                expect(error).toEqual('User cannot be created');
            };
        });
    })
})