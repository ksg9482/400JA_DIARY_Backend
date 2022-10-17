import { User } from "@/interfaces/User";
import jwt from 'jsonwebtoken';
import config from "@/config";

export default class JwtUtil {
    
    public generateToken(user:User):string {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);
        const token = jwt.sign(
            {
                id: user.id,
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
