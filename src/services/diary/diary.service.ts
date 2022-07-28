import { IDiary } from '@/interfaces/IDiary';
import { Logger } from 'winston'; //@로 표기했었음. jest오류

import { HydratedDocument } from 'mongoose';

//post - create diary
//get - diary(by id)
//get - all diary
//patch - change diary
//delete - diary
//get - diary search(word, date)

export default class DiaryService {
    diaryModel: Models.DiaryModel;
    logger: Logger;
    
    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(diaryModel:Models.DiaryModel, logger:Logger) {
        this.diaryModel = diaryModel;
        this.logger = logger;
    };

    public async createDiaryContent (userId:string, diaryContent:any) { //만들어야 됨
        try {
            console.log(userId, diaryContent)
            if (!diaryContent) {
                throw new Error("No Diary parametor");
            }
            const recentDate = new Date()
            //content 안들어갔음
            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId:userId,
                content:diaryContent,
                createAt:recentDate
            });
            const diarySave = await diaryRecord.save();
            return diarySave;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findAllDiary (userId:string) {
        try {
            const diaryRecord = this.diaryModel.find({id:userId});
            console.log('input - ',userId,diaryRecord);
            return diaryRecord;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }
}