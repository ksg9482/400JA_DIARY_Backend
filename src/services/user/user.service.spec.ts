import User from '../../models/user'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import JwtUtil from "../utils/jwtUtils";
import UserService from "./user.service";
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

    describe('editUser', () => {
        const userId = 'userId'
        const passwordObj = {
            password:'123456',
            changePassword:'654321'
        }
        it('password를 전송하지 않았으면 No Password를 반환해야 한다.', async () => {
            try {
                const result = await service.editUser(userId,{...passwordObj, password:''});
            } catch (error) {
                expect(error).toEqual(new Error('No Password'));
            };
        });

        it('changePassword를 전송하지 않았으면 No Password를 반환해야 한다.', async () => {
            try {
                const result = await service.editUser(userId,{...passwordObj, changePassword:''});
            } catch (error) {
                expect(error).toEqual(new Error('No Password'));
            };
        });

        it('password와 changePassword가 같으면 No Password를 반환해야 한다.', async () => {
            try {
                const result = await service.editUser(userId,{...passwordObj, changePassword:'123456'});
            } catch (error) {
                expect(error).toEqual(new Error('Same Password'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(undefined)
                const result = await service.editUser(userId, passwordObj);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같지 않으면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(passwordObj.password)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.editUser(userId, passwordObj);
            } catch (error) {
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('올바른 userId와 password객체를 전송하면 Password Changed를 반환해야 한다.', async () => {
            User.findById = jest.fn().mockResolvedValue(passwordObj.password);
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true));
            User.updateOne = jest.fn().mockResolvedValue('changed');
            const result = await service.editUser(userId, passwordObj);
            console.log(result)
            expect(result).toEqual({message:'Password Changed'});
        });
    });

    describe('deleteUser', () => {
        const userId = 'userId'
        const validPassword = '123456'
        it('password를 전송하지 않았으면 No Password를 반환해야 한다.', async () => {
            try {
                const result = await service.deleteUser(userId, '');
            } catch (error) {
                expect(error).toEqual(new Error('Empty Password'));
            };
        });


        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(undefined)
                const result = await service.deleteUser(userId, validPassword);
            } catch (error) {
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같지 않으면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(validPassword)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.deleteUser(userId, validPassword);
            } catch (error) {
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('올바른 userId와 password를 전송하면 User Deleted를 반환해야 한다.', async () => {
            User.findById = jest.fn().mockResolvedValue(validPassword);
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true));
            User.deleteOne = jest.fn().mockResolvedValue('deleted');
            const result = await service.deleteUser(userId, validPassword);
            
            expect(result).toEqual({message:'User Deleted'});
        });

    });
})