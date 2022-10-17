import UserService from "./user.service";
import User from '@/models/user';
import logger from '@/loaders/logger';
import JwtUtil from '@/services/utils/jwtUtils';
import HashUtil from "@/services/utils/hashUtils";

export function createUserInstance():UserService {
    //유저 인스턴스를 생성하는 팩토리 패턴
    return new UserService(User, logger, new JwtUtil, new HashUtil)
}
