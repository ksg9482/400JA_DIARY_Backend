//get - me
//patch -  user data
//delete -  user
import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston';
import User from '../../models/user'
import jwt from 'jsonwebtoken';
import config from '../../config'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';
import JwtUtil from '../utils/jwtUtils';
import logger from '../../loaders/logger';


export default class UserService {
    userModel: Models.UserModel;
    logger: Logger
    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor() {
        this.userModel = User,
        this.logger = logger
    }

    public async signup(userInputDTO: IUserInputDTO): Promise<{ user: IUser, token: string }> {
        try {
            //DTO 체크
            if (!userInputDTO.email || !userInputDTO.password) {
                throw new Error("No user parametor");
            }
            //중복 체크
            const userCheck = await this.userModel.findOne({ email: userInputDTO.email });
            if (userCheck) {
                throw new Error('Already Email');
            }

            this.logger.silly('Hashing password');
            const hashedPassword = await HashUtil.hashPassword(userInputDTO.password);

            this.logger.silly('Creating user db record');
            const userRecord: HydratedDocument<IUser> = new this.userModel({
                ...userInputDTO,
                password: hashedPassword
            })
            const userSave = await userRecord.save()
            console.log(userSave)
            if (userSave.errors) {
                throw new Error('User cannot be created');
            };

            this.logger.silly('Generating JWT');
            const token = JwtUtil.generateToken(userRecord);


            this.logger.silly('Sending welcome email');
            // 여기에 메일러로 월컴 이메일 보내는 로직

            // 이벤트 디스페처
            // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

            //const user = {...userRecord}; //이거보단 usersave로 받는게 좋을듯?
            const user = { ...userSave['_doc'] };
            Reflect.deleteProperty(user, 'password');
            return { user, token };
        } catch (error) {
            this.logger.error(error);
            //이미 만들어진 Error 객체를 보내는 역할. 여기도 new Error 하면 뎁스만 더 깊어짐.
            return error;
        }
    };

    public async login(userInputDTO: IUserInputDTO): Promise<{ user: IUser, token: string }> {
        try {
            if (!userInputDTO.email || !userInputDTO.password) {
                throw new Error("No user parametor");
            }

            const userRecord = await this.userModel.findOne({ email: userInputDTO.email });
            if (!userRecord) {
                throw new Error('User not registered');
            };

            this.logger.silly('Checking password');

            const validPassword = await HashUtil.checkPassword(userInputDTO.password);
            if (!validPassword) {
                throw new Error('Invalid Password');
            };

            this.logger.silly('Password is valid');
            this.logger.silly('Generating JWT');

            const token = JwtUtil.generateToken(userRecord);

            const user = { ...userRecord['_doc'] };
            Reflect.deleteProperty(user, 'password');

            return { user, token };

        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public async findById(id:string): Promise<{ id: string, email: string }> { //me
        try {
            const userRecord = await this.userModel.findById(id);
            if (!userRecord) {
                throw new Error('User not registered');
            };
            
            return {id:userRecord.id, email:userRecord.email}
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async editUser(id:string) {
        try {
            const userRecord = await this.userModel.findById(id);
            if (!userRecord) {
                throw new Error('User not registered');
            };

        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public async deleteUser(id:string) {
        try {
            const userRecord = await this.userModel.findById(id);
            if (!userRecord) {
                throw new Error('User not registered');
            };

        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public verifyEmail() {

    };
};

export function createUser():UserService {
    //유저 인스턴스를 생성하는 팩토리 패턴
    return new UserService()
}
