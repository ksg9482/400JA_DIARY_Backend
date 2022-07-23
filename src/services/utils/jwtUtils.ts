import { IUser } from "../../interfaces/IUser";
import jwt from 'jsonwebtoken';
import config from "../../config";

export default class JwtUtil {
    //의존성 주입?
    private jwtSecret:string
    constructor() {
        this.jwtSecret = config.jwtSecret
    }
    static generateToken(user:IUser):string {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);
    
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

    static verifyToken(this:,token:string, ) {
        jwtSecret
        const verity = jwt.verify(token, jwtSecret);
        if(!verity) {
            return 'inveridToken';
        }
        return verity;
    };


};
// export default class HashUtil {
//     static generateToken(user) {
//         const today = new Date();
//         const exp = new Date(today);
//         exp.setDate(today.getDate() + 60);
    
//         /**
//          * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
//          * The cool thing is that you can add custom properties a.k.a metadata
//          * Here we are adding the userId, role and name
//          * Beware that the metadata is public and can be decoded without _the secret_
//          * but the client cannot craft a JWT to fake a userId
//          * because it doesn't have _the secret_ to sign it
//          * more information here: https://softwareontheroad.com/you-dont-need-passport
//          */
//         logger.silly(`Sign JWT for userId: ${user._id}`);
//         return jwt.sign(
//           {
//             _id: user._id, // We are gonna use this in the middleware 'isAuth'
//             role: user.role,
//             name: user.name,
//             exp: exp.getTime() / 1000,
//           },
//           config.jwtSecret
//         );
//       }
// }