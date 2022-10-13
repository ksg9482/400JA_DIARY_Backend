//get - me
//patch -  user data
//delete -  user
import { IUser, IUserDocument, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';
import JwtUtil from '../utils/jwtUtils';

interface IpasswordObj {
    password: string;
    changePassword: string;
}

export default class UserService {
    userModel: Models.UserModel;
    logger: Logger;
    jwt: JwtUtil;
    hashUtil: HashUtil
    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(userModel: Models.UserModel, logger: Logger, jwt: JwtUtil, hashUtil: HashUtil) {
        this.userModel = userModel;
        this.logger = logger;
        this.jwt = jwt;
        this.hashUtil = hashUtil;
    }

    public async signup(userInputDTO: IUserInputDTO, oauthType?: string): Promise<{ user: IUser, token: string }> {
        try {
            if (!userInputDTO.email || !userInputDTO.password) {
                throw new Error("No signup parametor");
            }
            //중복 체크
            const userCheck = await this.userModel.findOne({ email: userInputDTO.email });
            if (userCheck) {
                throw new Error('Email Already Exists');
            }

            this.logger.silly('Hashing password');
            //const hashedPassword = await this.hashUtil.hashPassword(userInputDTO.password);

            this.logger.silly('Creating user db record');
            //const oauthTypeInput = oauthType ? oauthType : 'BASIC'
            const userRecord: HydratedDocument<IUser> = new this.userModel(
                {
                    ...userInputDTO,
                    type: oauthType
                }
            );
            const userSave = await userRecord.save()
            if (userSave.errors) {
                throw new Error('Create User Account Fail');
            };

            // this.logger.silly('Generating JWT');
            // const token = this.jwt.generateToken(userRecord)

            this.logger.silly('Sending welcome email');
            // 여기에 메일러로 월컴 이메일 보내는 로직

            // 이벤트 디스페처
            // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

            //회원가입에서도 토큰을 발급하는 이유는 소셜로그인으로 가입했을 경우 바로 토큰을 보내주기 위함
            const token = this.jwt.generateToken(userRecord);
            if (!token) {
                throw new Error('Token generate fail');
            }

            const user = this.setUserForm(userRecord);
            return { user, token };

        } catch (error) {
            this.logger.error(error);
            //이미 만들어진 Error 객체를 보내는 역할. 여기도 new Error 하면 뎁스만 더 깊어짐.
            throw error;
        }
    };

    public async login(email: string, password: string) {
        try {
            // const checkUserInputDTO = (userInputDTO: IUserInputDTO) => {
            //     let isValid = true;
            //     const checkArr = ['email', 'password'];
            //     checkArr.forEach((targetParametor) => {
            //         if (!userInputDTO[targetParametor]) {
            //             isValid = false;
            //         }
            //     });
            //     return isValid;
            // };
            if (!email || !password) {
                throw new Error("No login parametor");
            }

            const userRecord = await this.userModel.findOne({ email: email });
            if (!userRecord) {
                throw new Error('User not registered');
            };

            this.logger.silly('Checking password');
            const validPassword = await this.hashUtil.checkPassword(password, userRecord.password);
            if (!validPassword) {
                throw new Error('Invalid Password');
            };

            this.logger.silly('Password is valid');
            this.logger.silly('Generating JWT');

            const token = this.jwt.generateToken(userRecord);
            if (!token) {
                throw new Error('Token generate fail');
            }

            const user = this.setUserForm(userRecord);
            return { user, token };

        } catch (error) {
            this.logger.error(error);
            throw error;
        };
    };

    public async findById(_id: string): Promise<{ id: string, email: string, role: string, type: string }> { //me
        try {
            const userRecord = await this.userModel.findById(_id);

            if (!userRecord) {
                throw new Error('User not registered');
            };

            return { id: userRecord.id, email: userRecord.email, role: userRecord.role, type: userRecord.type }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    };

    public async passwordChange(_id: string, passwordChange: string) {
        try {
            if (!passwordChange) {
                throw new Error('No Password');
            }; // length로 보는게 좋을지도? 아니면 검증함수 만들기

            let userRecord = await this.userModel.findById(_id);
            if (!userRecord) {
                throw new Error('User not registered');
            };
            userRecord.password = passwordChange;
            const result = await userRecord.save();

            return { message: 'Password Changed' };
        } catch (error) {
            this.logger.error(error);
            throw error;
        };
    };

    public async passwordValid(_id: string, password: string) {
        try {
            const checkPassword = (password: string) => {
                return password.length === 0;
            };
            if (checkPassword(password)) {
                throw new Error('Empty Password');
            };

            const userRecord = await this.userModel.findById(_id);
            if (!userRecord) {
                throw new Error('User not registered');
            };

            const passwordIsTrue = await this.hashUtil.checkPassword(password, userRecord.password);
            if (!passwordIsTrue) {
                throw new Error('Invalid Password');
            };

            return true;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
    public async findUserByEmail(email: string) {
        try {
            const userRecord = await this.userModel.findOne({ email: email });

            if (!userRecord) {
                throw new Error('User not registered');
            };
            return userRecord;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }


    };

    /**
     * 
     * @returns 임의의 8자리 숫자로 생성된 문자열
     */
    public async tempPassword(id: any) {
        try {
            const randomPassword = String(Math.round(Math.random() * 100000000));

            let userRecord = await this.userModel.findById(id);
            userRecord.password = randomPassword;

            //실패할경우 임시비밀번호 발급 안되고 500에러
            const changePassword = await userRecord.save();
            const sendTempPassword = await this.sendEmail(String(randomPassword));

            return { message: `${randomPassword}` };
        } catch (error) {
            this.logger.error(error);
            throw error;
        }

        //임시비밀번호로 변경
        //등록된 이메일로 임시비번 전송
        //임시 비밀번호 보냈다고 전송.
    };

    public async deleteUser(id: string) {
        const userDelete = await this.userModel.deleteOne({ id: String(id) });
        return { message: 'User Deleted' };
    };

    public async oauthLogin(email: string, id: string, oauthType: string) {
        const userCheck = await this.userModel.findOne({ email: email });
        if (userCheck) {
            return await this.login(email, id/*password*/);
        } else {
            return await this.signup({ email: email, password: id }, oauthType)
        };
    };

    protected setUserForm(userRecord: any) {
        const userRecordCopy = { ...userRecord['_doc'] };
        if (userRecordCopy.password) {
            Reflect.deleteProperty(userRecordCopy, 'password');
        };
        if (userRecordCopy.role) {
            Reflect.deleteProperty(userRecordCopy, 'role');
        };

        return userRecordCopy;
    }

    public async sendEmail(content: string) {
        // 메일건 가져와서 보내기
        return true
    };


};

