import DiaryService from "./diary.service";
import Diary from '@/models/diary'
import logger from '@/loaders/logger';


export function createDiaryInstance():DiaryService {
    return new DiaryService(Diary, logger)
}
