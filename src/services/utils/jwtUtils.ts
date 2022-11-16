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
            config.jwtAccess,
            {expiresIn:'10m'}
        );
        if(!token) {
            throw new Error('Token generate fail');
        }
        return token;
    };

    public refreshToken (user:User) {
        const token = jwt.sign(
            {
                id: user.id,
            },
            config.jwtRefresh,
            {expiresIn:'1d'}
        );
        if(!token) {
            throw new Error('Refresh token generate fail');
        }
        return token;
    }

    public verifyToken(token:string) {
    
        const verify = jwt.verify(token, config.jwtAccess);
        if(!verify) {
            return 'Invalid Token';
        }
        return verify;
    };


};
