import AuthService from "./user.service";
import User from '../../models/user'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import { Document } from "mongoose";
import JwtUtil from "../utils/jwtUtils";
import UserService from "./user.service";
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
    let service: UserService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new UserService()
    })
    describe('signup',() => {
        const signupArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.signup({ email: '',password: 'mock'});
            } catch (error) {
                expect(error).toEqual(new Error('No user parametor'));
            };
        });

        it('이미 등록된 email이라면 Already Email를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(signupArg)
                const result = await service.signup(signupArg);
            } catch (error) {
                expect(error).toEqual(new Error('Already Email'));
            };
        });

        it('유저 생성에 실패하면 User cannot be created를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                HashUtil.hashPassword = jest.fn().mockResolvedValue(Promise.resolve('hassed Password'))
                jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({errors:'DocumentNotFoundError'}))
                const result = await service.signup(signupArg);
            } catch (error) {
                expect(error).toEqual(new Error('User cannot be created'));
            };
        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {
            
            User.findOne = jest.fn().mockResolvedValue(undefined)
            HashUtil.hashPassword = jest.fn().mockResolvedValue(Promise.resolve('hassed Password'))
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({_doc:{...signupArg}}))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue('valid_token')
            const result = await service.signup(signupArg);
            console.log(result)
            expect(result.token).toEqual('valid_token');
            expect(result.user).toEqual({email:signupArg.email});
        
    });
    });

    describe('login',() => {
        const loginArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.login({ email: '',password: 'mock'});
            } catch (error) {
                expect(error).toEqual(new Error('No user parametor'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                const result = await service.login(loginArg);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('비밀번호 체크를 통과하지 못하면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(loginArg)
                HashUtil.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.login(loginArg);
            } catch (error) {
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {
            
                User.findOne = jest.fn().mockResolvedValue({_doc:{...loginArg}})
                HashUtil.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
                JwtUtil.prototype.generateToken = jest.fn().mockReturnValue('valid_token')
                //jest.spyOn(User as any, 'generateToken').mockResolvedValue('valid_token')
                const result = await service.login(loginArg);
                expect(result.token).toEqual('valid_token');
                expect(result.user).toEqual({email:loginArg.email});
            
        });
    })

})