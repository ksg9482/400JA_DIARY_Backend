import AuthService from './auth.service';
import logger from '@/loaders/logger';
import JwtUtil from '@/services/utils/jwtUtils';
import CommonUtils from '@/services/utils/commonUtils';

export function createAuthInstance(): AuthService {
  //유저 인스턴스를 생성하는 팩토리 패턴
  return new AuthService(logger, new JwtUtil, new CommonUtils);
}
