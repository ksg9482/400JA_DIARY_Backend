import User from '../../models/user'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import JwtUtil from "../utils/jwtUtils";
import UserService from "./user.service";

describe('UserService', () => {
    let service: UserService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new UserService(User, logger, new JwtUtil, new HashUtil)
    })
    describe('signup', () => {
        const signupArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.signup({ email: '', password: 'mock' });
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
                HashUtil.prototype.hashPassword = jest.fn().mockResolvedValue(Promise.resolve('hassed Password'))
                jest.spyOn(User.prototype, 'save')
                    .mockImplementationOnce(() => Promise.resolve({ errors: 'DocumentNotFoundError' }))
                const result = await service.signup(signupArg);
            } catch (error) {
                expect(error).toEqual(new Error('User cannot be created'));
            };
        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {

            User.findOne = jest.fn().mockResolvedValue(undefined)
            HashUtil.prototype.hashPassword = jest.fn().mockResolvedValue(Promise.resolve('hassed Password'))
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ _doc: { ...signupArg } }))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue('valid_token')
            const result = await service.signup(signupArg);
            expect(result.token).toEqual('valid_token');
            expect(result.user).toEqual({ email: signupArg.email });

        });
    });

    describe('login', () => {
        const loginArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.login({ email: '', password: 'mock' });
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
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.login(loginArg);
            } catch (error) {
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {

            User.findOne = jest.fn().mockResolvedValue({ _doc: { ...loginArg } })
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue('valid_token')
            const result = await service.login(loginArg);
            expect(result.token).toEqual('valid_token');
            expect(result.user).toEqual({ email: loginArg.email });

        });
    });

    describe('findById', () => {
        const invaildUserId = 'invalId';
        const validUserData = {
            id: 'validId',
            email: 'valid@email.com',
            role: 'user'
        }
        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                const result = await service.findById(invaildUserId);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('올바른 userId면 id와 email과 role을 반환해야 한다.', async () => {
            User.findById = jest.fn().mockResolvedValue({ ...validUserData })
            const result = await service.findById(validUserData.id);
            expect(result.id).toEqual(validUserData.id);
            expect(result.email).toEqual(validUserData.email);
            expect(result.role).toEqual(validUserData.role);
        });
    });

    describe('passwordChange', () => {
        const inputData = {
            _id: 'validId',
            passwordChange: 'validPassword'
        };


        it('passwordChange 길이가 0이거나 없으면 No Password를 반환한다', async () => {
            try {
                const result = await service.passwordChange(inputData._id, '');
            } catch (error) {
                expect(error).toEqual(new Error('No Password'));
            };
        });
        it('유저를 찾을 수 없으면 User not registered를 반환한다', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(null);
                const result = await service.passwordChange(inputData._id, inputData.passwordChange);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });
        it('비밀번호가 변경되었으면 Password Changed를 반환한다.', async () => {
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve('saved'))
            User.findById = jest.fn().mockReturnValue({
                data: { id: 'validId', password: 'originPassword' },
                save: jest.fn().mockResolvedValue('saved')
            })
            const result = await service.passwordChange(inputData._id, inputData.passwordChange);
            expect(result).toEqual({ message: 'Password Changed' });
        });
    });

    describe('passwordValid', () => {
        const inputData = {
            _id: 'validId',
            password: 'validPassword'
        };


        it('password의 길이가 0이면 Empty Password를 반환한다', async () => {
            try {
                const result = await service.passwordValid(inputData._id, '');
            } catch (error) {
                expect(error).toEqual(new Error('Empty Password'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(undefined)
                const result = await service.passwordValid(inputData._id, inputData.password);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같지 않으면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(inputData.password)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.passwordValid(inputData._id, inputData.password);
            } catch (error) {
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같으면 true를 반환한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(inputData.password)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
                const result = await service.passwordValid(inputData._id, inputData.password);
                expect(result).toEqual(true);
            } catch (error) {

            };
        });
    });

    describe('checkEmail', () => {
        it('해당하는 email이 없으면 false를 반환한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(undefined);
            const result = await service.checkEmail('test@test.com2222');
            expect(result).toEqual(false);
        });
        it('해당하는 email이 있으면 ID를 반환한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue({ id: 'invalidId' });
            const result = await service.checkEmail('test@test.com');
            expect(result).toEqual({ id: 'invalidId' });
        });
    });

    describe('tempPassword', () => {

        it('교체된 비밀번호를 반환한다.', async () => {
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve('saved'))
            User.findById = jest.fn().mockReturnValue({
                data: { id: 'validId', password: 'unchanged' },
                save: jest.fn().mockResolvedValue('saved')
            })
            Math.random = jest.fn().mockReturnValue(1);
            Math.round = jest.fn().mockReturnValue(100000000);
            const result = await service.tempPassword('validId');
            expect(result).toEqual({ message: "100000000" });
        });
    });

    describe('deleteUser', () => {
        it('유저 정보를 삭제하고 User Deleted를 반환해야 한다.', async () => {
            User.deleteOne = jest.fn().mockResolvedValue({})
            const result = await service.deleteUser('userId');
            expect(result).toEqual({ message: 'User Deleted' });
        });
    });

    describe('oauthLogin', () => {
        const oauthLoginInput = { email: 'email', id: 'id', oauthType: 'oauthType' }
        it('해당하는 유저정보가 없으면 signup을 호출해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(undefined);
            service.signup = jest.fn().mockResolvedValue('signup');
            const result = await service.oauthLogin(oauthLoginInput.email, oauthLoginInput.id, oauthLoginInput.oauthType);
            expect(service.signup).toBeCalledTimes(1)
        });

        it('해당하는 유저정보가 있으면 login을 호출해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue('validUser');
            service.login = jest.fn().mockResolvedValue('login');
            const result = await service.oauthLogin(oauthLoginInput.email, oauthLoginInput.id, oauthLoginInput.oauthType);
            expect(service.login).toBeCalledTimes(1)
        });
    });
})