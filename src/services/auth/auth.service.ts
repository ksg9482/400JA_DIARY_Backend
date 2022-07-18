import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston';
import jwt from 'jsonwebtoken';
import config from '../../config'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';


export default class AuthService {
    userModel: Models.UserModel;
    logger: Logger
    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(userModel: Models.UserModel, logger: Logger) {
        this.userModel = userModel,
            this.logger = logger
    }

    public async Signup(userInputDTO: IUserInputDTO): Promise<{ user: IUser, token: string }> {
        try {
            //DTO 체크
            if(!userInputDTO.email || !userInputDTO.password){
                throw new Error("No user parametor");
            }
            //중복 체크
            const userCheck = await this.userModel.findOne({ email: userInputDTO.email });
            if(userCheck) {
                throw new Error('Email already');
            }
            this.logger.silly('Hashing password');
            const hashedPassword = await HashUtil.hashPassword(userInputDTO.password);

            this.logger.silly('Creating user db record');
            const userRecord: HydratedDocument<IUser> = new this.userModel({
                ...userInputDTO,
                password: hashedPassword
            })
            await userRecord.save()

            this.logger.silly('Generating JWT');
            const token = this.generateToken(userRecord);

            if (!userRecord) {
                throw new Error('User cannot be created');
            };

            this.logger.silly('Sending welcome email');
            // 여기에 메일러로 월컴 이메일 보내는 로직

            // 이벤트 디스페처
            // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

            const user: IUser = userRecord.toObject();
            Reflect.deleteProperty(user, 'password');
            return { user, token };
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    };

    public async login(userInputDTO: IUserInputDTO): Promise<{ user: IUser, token: string }> {
        try {
            const userRecord = await this.userModel.findOne({ email: userInputDTO.email });
            if (!userRecord) {
                throw new Error('User not registered');
            };

            this.logger.silly('Checking password');
            const validPassword = await HashUtil.checkPassword(userInputDTO.password);

            if (validPassword) {
                this.logger.silly('Password is valid!');
                this.logger.silly('Generating JWT');
                const token = this.generateToken(userRecord);
                const user = userRecord.toObject();
                Reflect.deleteProperty(user, 'password');
                return { user, token };
            } else {
                throw new Error('Invalid Password');
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }

    }

    private generateToken(user:IUser) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        this.logger.silly(`Sign JWT for userId: ${user._id}`);
        return jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
                exp: exp.getTime() / 1000,
            },
            config.jwtSecret
        );
    };

}