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
            //const testInit = await this.diaryModel.deleteMany() //지울것!!
            const isDiaryParametor = (diaryContent) => {
                return diaryContent?.content.length <= 0
            }
            if (isDiaryParametor(diaryContent)) { 
                throw new Error("No Diary parametor");
            };

            const contentBody = diaryContent.content;
            
            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId:userId,
                content:contentBody
            });
            
            const diarySave = await diaryRecord.save();
            
            return {message:'saved'};
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findAllDiary (userId:string) {
        try {
            const diaryRecord = await this.diaryModel.find({id:userId});
            
            if (!diaryRecord) {
                throw new Error('Diary in Empty');
            };

            return diaryRecord;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

}