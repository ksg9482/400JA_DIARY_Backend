import { IUser } from "../../interfaces/IUser";
import jwt, { Secret } from 'jsonwebtoken';
import config from "../../config";
import { IattachCurrentUserRequest } from "@/interfaces/IRequest";
import { IToken } from "@/interfaces/IToken";

export default class JwtUtil {
    
    public generateToken(user:IUser):string {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
                exp: exp.getTime() / 1000
            },
            config.jwtSecret
        );
        if(!token) {
            throw new Error('Token generate fail');
        }
        return token;
    };

    public verifyToken(token:string) {
    
        const verify = jwt.verify(token, config.jwtSecret);
        if(!verify) {
            return 'Invalid Token';
        }
        return verify;
    };


};
