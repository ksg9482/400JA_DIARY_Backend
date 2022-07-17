import bcrypt from 'bcrypt';

export default class HashUtil {
  static async hashPassword(password: string):Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  static async checkPassword(password: string):Promise<boolean> {
    const result = await this.hashPassword(password)
      .then(async (hashedPassword) => {
        return await bcrypt.compare(password, hashedPassword)
      })
      .catch((error)=>{
        throw new Error(error)
      })
    return result;
  };

}


