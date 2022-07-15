import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import UserModel from '@/models/user';
import { randomBytes } from 'crypto';
import { Logger } from 'winston';

export default class AuthService {
    userModel:IUser; 
    logger:Logger
    constructor(userModel:IUser, logger:Logger) {
        this.userModel = userModel,
        this.logger = logger
    }

    public async Signup (userInputDTO:IUserInputDTO):Promise<{user:IUser, token: string}> {
        try {
            const salt = randomBytes(32);
            this.logger.silly('Hashing password');
            const hashedPassword = 'Mock password!!!';
            this.logger.silly('Creating user db record');
            const userRecord ='user create logic!!!';
            this.logger.silly('Generating JWT');
            const token = 'Mock jwt!!!';

            if(!userRecord) {
                throw new Error('User cannot be created');
            };

            this.logger.silly('Sending welcome email');
            // 여기에 메일러로 월컴 이메일 보내는 로직

            // 이벤트 디스페처
            // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

            const user = {_id:'mockId', email:'mockEmail', password:'mockPassword', salt:'mockSalt'}//userRecord.toObject();

            return { user, token };
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}