import { User, UserReturnForm, UserInputDTO, UserOutputDTO, UserWithToken } from '@/interfaces/User';
import { Logger } from 'winston';
import JwtUtil from '@/services/utils/jwtUtils';
import HashUtil from "@/services/utils/hashUtils";
import { HydratedDocument } from 'mongoose';

export default class UserService {
    userModel: Models.UserModel;
    logger: Logger;
    jwt: JwtUtil;
    hashUtil: HashUtil

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


        const userCheck = await this.userModel.findOne({ email: userInputDTO.email });
        if (userCheck) {
            throw new Error('Email Already Exists');
        }
        this.logger.silly('Creating user db record');
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
        const accessToken = this.jwt.generateToken(userRecord);
        const refreshToken = this.jwt.refreshToken(userRecord);

        const user = this.setUserForm(userRecord);
        return { user, accessToken, refreshToken }; //Oauth로그인이 이 token 이용
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

        const accessToken = this.jwt.generateToken(userRecord);
        const refreshToken = this.jwt.refreshToken(userRecord);

        const user = this.setUserForm(userRecord);
        return { user, accessToken, refreshToken };

    };

    public async findById(id: string): Promise<UserOutputDTO> { //me
        const userRecord = await this.userModel.findById(id);
        if (!userRecord) {
            throw new Error('User not registered');
        };

        Reflect.deleteProperty(userRecord, 'password');
        return userRecord
    };

    public async passwordChange(id: string, passwordChange: string): Promise<{ message: string }> {
        if (!passwordChange) {
            throw new Error('No Password');
        };

        let userRecord = await this.userModel.findById(id);
        if (!userRecord) {
            throw new Error('User not registered');
        };
        userRecord.password = passwordChange;
        const result = await userRecord.save();

        return { message: 'Password Changed' };
    };

    public async passwordValid(id: string, password: string): Promise<boolean> {
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


    public async changeTempPassword(id: any): Promise<string> {
        const randomPassword = String(Math.round(Math.random() * 100000000));

        let userRecord = await this.userModel.findById(id);
        userRecord.password = randomPassword;


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

    public async refresh(refreshToken: string) {
        const verifyToken = this.jwt.verifyRefreshToken(refreshToken);
        
        if (!verifyToken) {
            throw new Error('Token expire');
        };
        const userRecord = await this.userModel.findById(verifyToken['id']);
        const accessToken = this.jwt.generateToken(userRecord);

        return accessToken;
    }

    protected setUserForm(userRecord: any): UserReturnForm {
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

