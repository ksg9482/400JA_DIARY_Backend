import AuthService from './auth.service';
import logger from '@/loaders/logger';
import JwtUtil from '@/services/utils/jwtUtils';
import CommonUtils from '@/services/utils/commonUtils';

export function createAuthInstance(): AuthService {
  return new AuthService(logger, new JwtUtil, new CommonUtils);
}
