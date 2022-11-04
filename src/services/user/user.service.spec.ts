import User from '@/models/user'
import logger from "@/loaders/logger";
import JwtUtil from '@/services/utils/jwtUtils';
import HashUtil from "@/services/utils/hashUtils";
import UserService from "./user.service";

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        service = new UserService(User, logger, new JwtUtil, new HashUtil)
    })
    afterEach(() => {
        jest.clearAllMocks();
      });
    describe('signup', () => {
        const signupArg = {
            email: 'mockEmail',
            password: 'mockPassword'
        };

        it('email이 없다면 Bad email parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.signup({ email: '', password: signupArg.password });
            } catch (error) {
                expect(error).toEqual(new Error('Bad email parametor'));
            };
        });

        it('password가 없다면 Bad password parametord 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.signup({ email: signupArg.email, password: '' });
            } catch (error) {
                expect(error).toEqual(new Error('Bad password parametor'));
            };
        });

        it('이미 등록된 email이라면 Already Email를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(signupArg);

                const result = await service.signup(signupArg);

            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: signupArg.email });
                expect(error).toEqual(new Error('Email Already Exists'));
            };
        });

        it('유저 생성에 실패하면 User cannot be created를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                jest.spyOn(User.prototype, 'save')
                    .mockImplementationOnce(() => Promise.resolve({ errors: 'DocumentNotFoundError' }));

                const result = await service.signup(signupArg);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: signupArg.email });
                expect(User.prototype.save).toHaveBeenCalledTimes(1);
                expect(error).toEqual(new Error('Create User Account Fail'));
            };
        });

        it('올바른 email과 password면 user와 jwt 토큰을 반환해야 한다.', async () => {
            const jwt = 'valid_token';

            User.findOne = jest.fn().mockResolvedValue(undefined)
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ _doc: { ...signupArg } }))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue(jwt);

            const result = await service.signup(signupArg);

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: signupArg.email });
            expect(User.prototype.save).toHaveBeenCalledTimes(1); 
            expect(result.user.email).toEqual(signupArg.email);
            expect(result.token).toEqual(jwt);
        });

        it('올바른 email과 password면 user와 jwt 토큰을 반환해야 한다.', async () => {
            const jwt = 'valid_token';

            User.findOne = jest.fn().mockResolvedValue(undefined)
            jest.spyOn(User.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ _doc: { ...signupArg } }))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue(jwt);

            const result = await service.signup(signupArg);

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: signupArg.email });
            expect(User.prototype.save).toHaveBeenCalledTimes(1); //바로 위 테스트의 save도 같이 식별했음.
            expect(result.user.email).toEqual(signupArg.email);
            expect(result.token).toEqual(jwt);
        });
    });

    describe('login', () => {
        const loginArg = {
            email: 'mockEmail',
            password: 'mockPassword'
        };

        it('email parametor가 없다면 Bad email parametor를 반환해야 한다.', async () => {
            try {
                const result = await service.login('', loginArg.password);
            } catch (error) {
                expect(error).toEqual(new Error('Bad email parametor'));
            };
        });

        it('password가 parametor가 없다면 Bad password parametor를 반환해야 한다.', async () => {
            try {
                const result = await service.login(loginArg.email, '');
            } catch (error) {
                expect(error).toEqual(new Error('Bad password parametor'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined)
                const result = await service.login(loginArg.email, loginArg.password);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: loginArg.email });
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('비밀번호 체크를 통과하지 못하면 Invalid Password를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue({ ...loginArg, password: 'differentPassword' })
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.login(loginArg.email, loginArg.password);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: loginArg.email });
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(loginArg.password, 'differentPassword'); //입력한 비번, 찾아서 나온 비번
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('토큰 발급에 실패하면 Token generate fail 에러를 반환해야 한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(loginArg)
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
                JwtUtil.prototype.generateToken = jest.fn().mockReturnValue(undefined)

                const result = await service.login(loginArg.email, loginArg.password);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: loginArg.email });
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(loginArg.password, loginArg.password);
                expect(JwtUtil.prototype.generateToken).toHaveBeenCalledTimes(1);
                expect(JwtUtil.prototype.generateToken).toHaveBeenCalledWith(loginArg);

                expect(error).toEqual(new Error('Token generate fail'));
            }

        });

        it('올바른 email과 password면 user와 token를 반환해야 한다.', async () => {
            const jwt = 'valid_token'
            User.findOne = jest.fn().mockResolvedValue(loginArg)
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))
            JwtUtil.prototype.generateToken = jest.fn().mockReturnValue(jwt);
            service['setUserForm'] = jest.fn().mockReturnValue({ email: loginArg.email });

            const result = await service.login(loginArg.email, loginArg.password);

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: loginArg.email });
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(loginArg.password, loginArg.password);
            expect(service['setUserForm']).toHaveBeenCalledTimes(1);
            expect(service['setUserForm']).toHaveBeenCalledWith(loginArg);

            expect(result.token).toEqual(jwt);
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
            id: 'validId',
            passwordChange: 'changePassword'
        };

        it('passwordChange 길이가 0이거나 없으면 No Password를 반환한다', async () => {
            try {
                const result = await service.passwordChange(inputData.id, '');
            } catch (error) {
                expect(error).toEqual(new Error('No Password'));
            };
        });
        it('유저를 찾을 수 없으면 User not registered를 반환한다', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(null);
                const result = await service.passwordChange(inputData.id, inputData.passwordChange);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData.id);
                expect(error).toEqual(new Error('User not registered'));
            };
        });
        it('비밀번호가 변경되었으면 Password Changed를 반환한다.', async () => {
            User.findById = jest.fn().mockReturnValue({
                data: { id: inputData.id, password: 'originPassword' },
                save: jest.fn().mockResolvedValue('saved')
            });

            const result = await service.passwordChange(inputData.id, inputData.passwordChange);
            
            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(inputData.id);
            expect(result).toEqual({ message: 'Password Changed' });
        });
    });

    describe('passwordValid', () => {
        const inputData = {
            id: 'validId',
            password: 'validPassword'
        };
        const differntPassword = 'differntPassword';

        it('password의 길이가 0이면 Empty Password를 반환한다', async () => {
            try {
                const result = await service.passwordValid(inputData.id, '');
            } catch (error) {
                expect(error).toEqual(new Error('Empty Password'));
            };
        });

        it('해당하는 유저가 없다면 User not registered를 반환해야 한다.', async () => {
            try {
                User.findById = jest.fn().mockResolvedValue(undefined)
                const result = await service.passwordValid(inputData.id, inputData.password);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData.id);
                expect(error).toEqual(new Error('User not registered'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같지 않으면 Invalid Password를 반환해야 한다.', async () => {
            try {

                User.findById = jest.fn().mockResolvedValue({ password: differntPassword })
                HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(false))
                const result = await service.passwordValid(inputData.id, inputData.password);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(inputData.id);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
                expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(inputData.password, differntPassword);
                expect(error).toEqual(new Error('Invalid Password'));
            };
        });

        it('입력한 비밀번호가 저장된 비밀번호와 같으면 true를 반환한다.', async () => {
            User.findById = jest.fn().mockResolvedValue({ password: inputData.password })
            HashUtil.prototype.checkPassword = jest.fn().mockResolvedValue(Promise.resolve(true))

            const result = await service.passwordValid(inputData.id, inputData.password);

            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(inputData.id);
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledTimes(1);
            expect(HashUtil.prototype.checkPassword).toHaveBeenCalledWith(inputData.password, inputData.password);
            expect(result).toEqual(true);

        });
    });

    describe('findUserByEmail', () => {
        const userEmail = 'userEmail@email.com';
        const invalidId = 'invalidId';
        it('해당하는 email이 없으면 User not registered 에러를 반환한다.', async () => {
            try {
                User.findOne = jest.fn().mockResolvedValue(undefined);
                const result = await service.findUserByEmail(userEmail);
            } catch (error) {
                expect(User.findOne).toHaveBeenCalledTimes(1);
                expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
                expect(error).toEqual(new Error('User not registered'));
            };
        });
        it('해당하는 email이 있으면 ID를 반환한다.', async () => {
            User.findOne = jest.fn().mockResolvedValue({ id: invalidId });
            const result = await service.findUserByEmail(userEmail);

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
            expect(result).toEqual({ id: invalidId });
        });
    });

    describe('changeTempPassword', () => {
        const userId = 'userId';
        it('교체된 비밀번호 저장에 실패할 경우 Change password fail 에러를 반환한다.', async () => {
            try {
                User.findById = jest.fn().mockReturnValue({
                    data: { id: userId, password: 'originalPassword' },
                    save: jest.fn().mockImplementationOnce(() => Promise.resolve({ errors: 'DocumentNotFoundError' }))
                })
                Math.random = jest.fn().mockReturnValue(1);
                Math.round = jest.fn().mockReturnValue(100000000);
                const result = await service.changeTempPassword(userId);
            } catch (error) {
                expect(User.findById).toHaveBeenCalledTimes(1);
                expect(User.findById).toHaveBeenCalledWith(userId);
                expect(error).toEqual(new Error('Change password fail'));
            };
        });

        it('교체된 비밀번호를 반환한다.', async () => {
            User.findById = jest.fn().mockReturnValue({
                data: { id: userId, password: 'originalPassword' },
                save: jest.fn().mockImplementationOnce(() => Promise.resolve('saved'))
            })
            Math.random = jest.fn().mockReturnValue(1);
            Math.round = jest.fn().mockReturnValue(100000000);
            const result = await service.changeTempPassword(userId);

            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual("100000000");
        });
    });

    describe('deleteUser', () => {
        const userId = 'userId';
        it('유저 정보를 삭제하고 User Deleted를 반환해야 한다.', async () => {
            User.deleteOne = jest.fn().mockResolvedValue({})
            const result = await service.deleteUser(userId);

            expect(User.deleteOne).toHaveBeenCalledTimes(1);
            expect(User.deleteOne).toHaveBeenCalledWith({ id: userId });
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
            const mockUser = {
                email: 'mockEmail',
                password: 'mockPassword'
            };
            it('유저 레코드를 입력하면 비밀번호를 제거한 객체를 반환한다.', async () => {
                const result:any = service['setUserForm'](
                    {
                        _doc: {
                            email: mockUser.email,
                            password: mockUser.password
                        }
                    }
                );
                expect(result).toEqual({ email: mockUser.email });
            });
        });

    });
})