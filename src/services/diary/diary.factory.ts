import DiaryService from "./diary.service";
import Diary from '../../models/diary'
import logger from '../../loaders/logger';
import config from "../../config";


export function createDiaryInstance():DiaryService {
    //유저 인스턴스를 생성하는 팩토리 패턴
    return new DiaryService(Diary, logger)
}
