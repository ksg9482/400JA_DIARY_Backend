import bcrypt from 'bcrypt';

export default class HashUtil {
  public async hashPassword(password: string):Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

//db에 저장된 비밀번호랑 들어온 비밀번호랑 비교해야함
  public async checkPassword(password: string, hashedPassword: string):Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  };

}


