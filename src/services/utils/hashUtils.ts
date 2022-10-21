import bcrypt from 'bcrypt';

export default class HashUtil {
  public async hashPassword(password: string):Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  public async checkPassword(password: string, hashedPassword: string):Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  };

}


