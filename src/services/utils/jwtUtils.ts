import { User } from "@/interfaces/User";
import jwt from 'jsonwebtoken';
import config from "@/config";

export default class JwtUtil {
    
    public generateToken(user:User):string {
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            config.jwtSecret,
            {expiresIn:'1m'}
        );
        if(!token) {
            throw new Error('Token generate fail');
        }
        return token;
    };

    public refreshToken (user:User) {
        // const today = new Date();
        // const exp = new Date(today);
        // exp.setDate(today.getDate() + 60);
        const token = jwt.sign(
            {
                id: user.id,
            },
            config.jwtSecret,
            {expiresIn:'1d'}
        );
        if(!token) {
            throw new Error('Refresh token generate fail');
        }
        return token;
    }

    public verifyToken(token:string) {
    
        const verify = jwt.verify(token, config.jwtSecret);
        if(!verify) {
            return 'Invalid Token';
        }
        return verify;
    };


};
