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
                expect(error).toEqual(new Error('No signup parametor'));
            };
        });

        it('이미 등록된 email이라면 Already Email를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(signupArg);

                const result = await service.signup(signupArg);
                
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({email:signupArg.email});
                expect(error).toEqual(new Error('Email Already Exists'));
            };
        });

        it('유저 생성에 실패하면 User cannot be created를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                jest.spyOn(User.prototype, 'save')
                    .mockImplementationOnce(() => Promise.resolve({ errors: 'DocumentNotFoundError' }))
                
                    const result = await service.signup(signupArg);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({email:signupArg.email});
                expect(User.prototype.save).toHaveBeenCalledTimes(1);
                expect(error).toEqual(new Error('Create User Account Fail'));
            };
        });

        it('올바른 email과 password면 user를 반환해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(undefined)
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ _doc: { ...signupArg } }))
            
            const result = await service.signup(signupArg);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({email:signupArg.email});
            expect(User.prototype.save).toHaveBeenCalledTimes(2); //바로 위 테스트의 save도 같이 식별했음.
            expect(result).toEqual({ email: signupArg.email });

        });
    });

    describe('login', () => {
        const loginArg = {
            email: 'mock',
            password: 'mock'
        };

        it('email parametor가 없다면 No login parametor를 반환해야 한다.', async () => {
            try {
                const result = await service.login("", 'mock');
            } catch (error) {
                expect(error).toEqual(new Error('No login parametor'));
            };
        });

        it('password가 parametor가 없다면 No login parametor를 반환해야 한다.', async () => {
            try {
                const result = await service.login("mock", '');
            } catch (error) {
                expect(error).toEqual(new Error('No login parametor'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                const result = await service.login('mockEmail', 'mockPassword');
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({email:'mockEmail'});
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('비밀번호 체크를 통과하지 못하면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(loginArg)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.login('mockEmail', 'mockPassword');
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({email:'mockEmail'});
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith("mockPassword", 'mock'); //입력한 비번, 찾아서 나온 비번
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('토큰 발급에 실패하면 Token generate fail 에러를 반환해야 한다.', async () => {
            try {
            User.findOne = jest.fn().mockResolvedValue(loginArg)
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue(undefined)
            
            const result = await service.login('mockEmail', 'mockPassword');
            } catch (error) {
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({email:'mockEmail'});
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith("mockPassword", 'mock');
            expect(JwtUtil.prototype.generateToken).toHaveBeenCalledTimes(1);
            expect(JwtUtil.prototype.generateToken).toHaveBeenCalledWith(loginArg);
            
            expect(error).toEqual(new Error('Token generate fail'));
            }

        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(loginArg)
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue('valid_token')
            service['setUserForm'] = jest.fn().mockReturnValue({ email: loginArg.email });
            
            const result = await service.login('mockEmail', 'mockPassword');

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({email:'mockEmail'});
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith("mockPassword", 'mock');
            expect(service['setUserForm']).toHaveBeenCalledTimes(1);
            expect(service['setUserForm']).toHaveBeenCalledWith(loginArg);
            
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
                User.findById = jest.fn().mockResolvedValue(undefined)
                const result = await service.findById(invaildUserId);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(invaildUserId);
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('올바른 userId면 id와 email과 role을 반환해야 한다.', async () => {
            User.findById = jest.fn().mockResolvedValue({ ...validUserData })
            const result = await service.findById(validUserData.id);

            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(validUserData.id);
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
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData._id);
                expect(error).toEqual(new Error('User not registered'));
            };
        });
        it('비밀번호가 변경되었으면 Password Changed를 반환한다.', async () => {
            User.findById = jest.fn().mockReturnValue({
                data: { id: 'validId', password: 'originPassword' },
                save: jest.fn().mockResolvedValue('saved')
            });
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve('saved'));
            
            const result = await service.passwordChange(inputData._id, inputData.passwordChange);
            
            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(inputData._id);
            expect(User.prototype.save).toHaveBeenCalledTimes(2);
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
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData._id);
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같지 않으면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue({password:'differntPassword'})
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.passwordValid(inputData._id, inputData.password);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData._id);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(inputData.password, 'differntPassword');
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같으면 true를 반환한다.', async () => {
            User.findById = jest.fn().mockResolvedValue({password:inputData.password})
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
                
                const result = await service.passwordValid(inputData._id, inputData.password);
                
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData._id);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(inputData.password, inputData.password);
                expect(result).toEqual(true);
            
        });
    });

    describe('findUserByEmail', () => {
        it('해당하는 email이 없으면 null을 반환한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(undefined);
            const result = await service.findUserByEmail('test@test.com2222');
            
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({email:'test@test.com2222'});
            expect(result).toEqual(null);
        });
        it('해당하는 email이 있으면 ID를 반환한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue({ id: 'invalidId' });
            const result = await service.findUserByEmail('test@test.com');
            
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({email:'test@test.com'});
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

            expect(User.prototype.save).toHaveBeenCalledTimes(2);
            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith('validId');
            expect(result).toEqual({ message: "100000000" });
        });
    });

    describe('deleteUser', () => {
        it('유저 정보를 삭제하고 User Deleted를 반환해야 한다.', async () => {
            User.deleteOne = jest.fn().mockResolvedValue({})
            const result = await service.deleteUser('userId');

            expect(User.deleteOne).toHaveBeenCalledTimes(1);
            expect(User.deleteOne).toHaveBeenCalledWith({ id: 'userId' });
            expect(result).toEqual({ message: 'User Deleted' });
        });
    });

    describe('oauthLogin', () => {
        const oauthLoginInput = { email: 'email', id: 'id', oauthType: 'oauthType' }
        it('해당하는 유저정보가 없으면 signup을 호출해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue(undefined);
            service.signup = jest.fn().mockResolvedValue('signup');

            const result = await service.oauthLogin(oauthLoginInput.email, oauthLoginInput.id, oauthLoginInput.oauthType);
            
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: oauthLoginInput.email });
            expect(service.signup).toHaveBeenCalledTimes(1);
            expect(service.signup).toHaveBeenCalledWith({ email: oauthLoginInput.email, password: oauthLoginInput.id }, oauthLoginInput.oauthType);
            expect(service.signup).toBeCalledTimes(1)
        });

        it('해당하는 유저정보가 있으면 login을 호출해야 한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue('validUser');
            service.login = jest.fn().mockResolvedValue('login');
            
            const result = await service.oauthLogin(oauthLoginInput.email, oauthLoginInput.id, oauthLoginInput.oauthType);
            
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: oauthLoginInput.email });
            expect(service.login).toHaveBeenCalledTimes(1);
            expect(service.login).toHaveBeenCalledWith(oauthLoginInput.email, oauthLoginInput.id);
            expect(service.login).toBeCalledTimes(1)
        });

        describe('setUserForm', () => {
            it('유저 레코드를 입력하면 비밀번호를 제거한 객체를 반환한다.', async () => {
                const result = service['setUserForm']({_doc:{email:'mockEmail',password:'mockPassword'}});
    
                expect(result).toEqual({ email:'mockEmail' });
            });
        });

    });
})