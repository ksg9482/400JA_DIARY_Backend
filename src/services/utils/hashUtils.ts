import bcrypt from 'bcrypt';

export default class HashUtil {
    static async hashPassword (password: string) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
      };
      
    static async checkPassword (password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
      };
}


