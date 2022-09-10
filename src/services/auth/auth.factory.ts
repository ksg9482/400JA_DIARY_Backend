import AuthService from './auth.service';
import User from '../../models/user';
import logger from '../../loaders/logger';
import JwtUtil from '../utils/jwtUtils';
import config from '../../config';
import HashUtil from '../utils/hashUtils';

export function createAuthInstance(): AuthService {
  //유저 인스턴스를 생성하는 팩토리 패턴
  return new AuthService(logger);
}
