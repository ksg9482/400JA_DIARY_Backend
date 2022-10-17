import { User, UserBase as UserInputDTO, UserWithToken } from '@/interfaces/User';
import { Logger } from 'winston'; //@로 표기했었음. jest오류
import JwtUtil from '@/services/utils/jwtUtils';
import HashUtil from "@/services/utils/hashUtils";
import { HydratedDocument } from 'mongoose';

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

    public async signup(userInputDTO: UserInputDTO, oauthType?: string): Promise<UserWithToken> {
        if (!userInputDTO.email) {
            throw new Error("Bad email parametor");
        };
        if (!userInputDTO.password) {
            throw new Error("Bad password parametor");
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
        const userRecord: HydratedDocument<User> = new this.userModel(
            {
                ...userInputDTO,
                type: oauthType
            }
        );
        const userSave = await userRecord.save()
        if (userSave.errors) {
            throw new Error('Create User Account Fail');
        };
        
        this.logger.silly('Sending welcome email');
        // 여기에 메일러로 월컴 이메일 보내는 로직

        // 이벤트 디스페처
        // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

        //회원가입에서도 토큰을 발급하는 이유는 소셜로그인으로 가입했을 경우 바로 토큰을 보내주기 위함
        const token = this.jwt.generateToken(userRecord);

        const user = this.setUserForm(userRecord);
        return { user, token };
    };

    public async login(email: string, password: string): Promise<UserWithToken> {
        if (!email) {
            throw new Error("Bad email parametor");
        };
        if (!password) {
            throw new Error("Bad password parametor");
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

        const user = this.setUserForm(userRecord);
        return { user, token };

    };

    public async findById(id: string): Promise<User> { //me
        const userRecord = await this.userModel.findById(id);

        if (!userRecord) {
            throw new Error('User not registered');
        };

        return { id: userRecord.id, email: userRecord.email, role: userRecord.role, type: userRecord.type }
    };

    public async passwordChange(id: string, passwordChange: string): Promise<{ message: string }> {
        if (!passwordChange) {
            throw new Error('No Password');
        }; // length로 보는게 좋을지도? 아니면 검증함수 만들기

        let userRecord = await this.userModel.findById(id);
        if (!userRecord) {
            throw new Error('User not registered');
        };
        userRecord.password = passwordChange;
        const result = await userRecord.save();

        return { message: 'Password Changed' };
    };

    public async passwordValid(id: string, password: string):Promise<boolean> {
        if (password.length === 0) {
            throw new Error('Empty Password');
        };

        const userRecord = await this.userModel.findById(id);
        if (!userRecord) {
            throw new Error('User not registered');
        };

        const passwordIsTrue = await this.hashUtil.checkPassword(password, userRecord.password);
        if (!passwordIsTrue) {
            throw new Error('Invalid Password');
        };

        return true;
    }

    public async findUserByEmail(email: string): Promise<any> {
        const userRecord = await this.userModel.findOne({ email: email });
        if (!userRecord) {
            throw new Error('User not registered');
        };
        return userRecord;
    };

    /**
     * 
     * @returns 임의의 8자리 숫자로 생성된 문자열
     */
    public async changeTempPassword(id: any): Promise<string> {
        const randomPassword = String(Math.round(Math.random() * 100000000));

        let userRecord = await this.userModel.findById(id); //깊은 복사로 수정해야함
        userRecord.password = randomPassword;

        //실패할경우 임시비밀번호 발급 안되고 500에러
        const changePassword = await userRecord.save();
        if (changePassword.errors) {
            throw new Error('Change password fail');
        };

        return randomPassword;
    };

    public async deleteUser(id: string): Promise<{ message: string }> {
        const userDelete = await this.userModel.deleteOne({ id: String(id) });
        return { message: 'User Deleted' };
    };

    public async oauthLogin(email: string, id: string, oauthType: string): Promise<UserWithToken> {
        const userCheck = await this.userModel.findOne({ email: email });
        if (userCheck) {
            return await this.login(email, id/*password*/);
        } else {
            return await this.signup({ email: email, password: id }, oauthType)
        };
    };

    protected setUserForm(userRecord: any): any {
        const userRecordCopy = { ...userRecord['_doc'] };
        if (userRecordCopy.password) {
            Reflect.deleteProperty(userRecordCopy, 'password');
        };
        if (userRecordCopy.role) {
            Reflect.deleteProperty(userRecordCopy, 'role');
        };

        return userRecordCopy;
    };
};

