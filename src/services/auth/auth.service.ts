import { IUser, IUserInputDTO } from '@/interfaces/IUser';
import { Logger } from 'winston';
import jwt from 'jsonwebtoken';
import config from '../../config'; //@로 표기했었음. jest오류
import HashUtil from '../utils/hashUtils';
import { HydratedDocument } from 'mongoose';
import JwtUtil from '../utils/jwtUtils';

export default class AuthService {
  logger: Logger;
  //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
  constructor(logger: Logger) {
    this.logger = logger;
  }

  //로그인 데이터는 똑같아야 한다
  //토큰에 로그인유형 무엇인지 추가해야 한다
  //회원가입 시 소셜인지 일반인지 -> 데이터베이스도 변동
  public async kakaoOAuth(code: string) {
    //클라이언트 키 받아서 카카오에 전송
    //토큰 받아서 jwt만들어 리턴
  }

  //이건 병합?
}
