//get - me
//patch -  user data
//delete -  user
import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';
import JwtUtil from '../utils/jwtUtils';

interface IpasswordObj{
    password: string;
    changePassword: string;
}

export default class UserService {
    userModel: Models.UserModel;
    logger: Logger;
    jwt: JwtUtil;
    hashUtil:HashUtil
    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(userModel:Models.UserModel, logger:Logger, jwt:JwtUtil, hashUtil:HashUtil) {
        this.userModel = userModel;
        this.logger = logger;
        this.jwt = jwt;
        this.hashUtil = hashUtil;
    }

    public async signup(userInputDTO: IUserInputDTO): Promise<{ user: IUser, token: string }> {
        try {
            //DTO 체크
            const checkUserInputDTO = (userInputDTO: IUserInputDTO) => {
                let isValid = true;
                const checkArr = ['email', 'password'];
                checkArr.forEach((targetParametor)=>{
                    if(!userInputDTO[targetParametor]) {
                        isValid = false;
                    }
                });
                return isValid;
            };

            if (!checkUserInputDTO(userInputDTO)) {
                throw new Error("No user parametor");
            }
            //중복 체크
            const userCheck = await this.userModel.findOne({ email: userInputDTO.email });
            if (userCheck) {
                throw new Error('Already Email');
            }

            this.logger.silly('Hashing password');
            //const hashedPassword = await this.hashUtil.hashPassword(userInputDTO.password);
            
            this.logger.silly('Creating user db record');
            const userRecord: HydratedDocument<IUser> = new this.userModel({
                ...userInputDTO,
                //password: hashedPassword
            })
            const userSave = await userRecord.save()
            
            if (userSave.errors) {
                throw new Error('User cannot be created');
            };

            this.logger.silly('Generating JWT');
            const token = this.jwt.generateToken(userRecord)
            
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
            const checkUserInputDTO = (userInputDTO: IUserInputDTO) => {
                let isValid = true;
                const checkArr = ['email', 'password'];
                checkArr.forEach((targetParametor)=>{
                    if(!userInputDTO[targetParametor]) {
                        isValid = false;
                    }
                });
                return isValid;
            };
            if (!checkUserInputDTO(userInputDTO)) {
                throw new Error("No user parametor");
            }

            const userRecord = await this.userModel.findOne({ email: userInputDTO.email });
            if (!userRecord) {
                throw new Error('User not registered');
            };

            this.logger.silly('Checking password');

            const validPassword = await this.hashUtil.checkPassword(userInputDTO.password, userRecord.password);
            if (!validPassword) {
                throw new Error('Invalid Password');
            };

            this.logger.silly('Password is valid');
            this.logger.silly('Generating JWT');

            const token = this.jwt.generateToken(userRecord);
            const user = { ...userRecord['_doc'] };
            
            Reflect.deleteProperty(user, 'password');

            return { user, token };

        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public async findById(_id:string): Promise<{ id: string, email: string, role: string }> { //me
        try {
            const userRecord = await this.userModel.findById(_id);
            
            if (!userRecord) {
                throw new Error('User not registered');
            };
            
            return {id:userRecord.id, email:userRecord.email, role: userRecord.role}
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };
    
    public async editUser(_id:string, passwordObj:IpasswordObj) {
        try {
            const checkPasswordObj = (passwordObj: IpasswordObj) => {
                let isValid = true;
                const checkArr = ['password', 'changePassword'];
                checkArr.forEach((targetParametor)=>{
                    if(!passwordObj[targetParametor]) {
                        isValid = false;
                    }
                });
                return isValid;
            };

            if(!checkPasswordObj(passwordObj)) {
                throw new Error('No Password');
            }; // length로 보는게 좋을지도? 아니면 검증함수 만들기

            const checkSamePassword = (passwordObj) => {
                return passwordObj.password === passwordObj.changePassword
            }
            if(checkSamePassword(passwordObj)) {
                throw new Error('Same Password');
            };

            const userRecord = await this.userModel.findById(_id);
            if (!userRecord) {
                throw new Error('User not registered');
            };
            
            const passwordIsTrue = await this.hashUtil.checkPassword(passwordObj.password, userRecord.password);
            if(!passwordIsTrue) {
                throw new Error('Invalid Password');
            }

            //const hashChangePassword = await this.hashUtil.hashPassword(passwordObj.changePassword);
            const userEdit = await this.userModel.updateOne({id:_id},{password:passwordObj.changePassword});
            
            return {message:'Password Changed'};
        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public async deleteUser(_id:string, password:string) {
        try {
            const checkPassword = (password) => {
                return password.length === 0
            }

            if(checkPassword(password)){
                throw new Error('Empty Password');
            }

            const userRecord = await this.userModel.findById(_id);
            if (!userRecord) {
                throw new Error('User not registered');
            };

            const passwordIsTrue = await this.hashUtil.checkPassword(password, userRecord.password);
            if(!passwordIsTrue) {
                throw new Error('Invalid Password');
            }

            const userDelete = await this.userModel.deleteOne({id:_id});
            //diary도 같이 삭제되야 함
            return {message:'User Deleted'};
        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    public verifyEmail() {

    };

    
};

