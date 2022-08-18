import { IDiary, IdiaryContent } from '@/interfaces/IDiary';
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
    constructor(diaryModel: Models.DiaryModel, logger: Logger) {
        this.diaryModel = diaryModel;
        this.logger = logger;
    };

    public async createDiaryContent(userId: string, diaryContent: IdiaryContent) { //만들어야 됨
        try {
            //const testInit = await this.diaryModel.deleteMany() //지울것!!
            this.checkdiaryContent(diaryContent)
            // 날짜가 '오늘'이라면 중복되지 말아야 한다.
            
            const contentBody = diaryContent.content;

            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId: userId,
                content: contentBody
            });

            await diaryRecord.save();

            return { message: 'saved' };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findAllDiary(userId: string) {
        try {
            const diaryRecord = await this.diaryModel.find({ id: userId });

            if (!diaryRecord) {
                throw new Error('Diary in Empty');
            };

            return diaryRecord;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findKeyword(userId: string, keyword: [string]) {

    }

    public async findByDate(userId: string, targetDate: Date) {
        //targetDate 서식 정해야함.
        try {
            //const diaryRecord = await this.diaryModel.find({id:userId, created_at:targetDate});
            const diaryRecord = await this.diaryModel.find()
                .all([{id:userId},{created_at:targetDate}])
            
                if (!diaryRecord) {
                throw new Error('Diary in Empty');
            };

            const setFindByDateForm = (diaryRecord:any) => {
                return {id:diaryRecord.id, content:diaryRecord.content}
            };

            return setFindByDateForm(diaryRecord);
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async deleteAllDiary(userId: string) {
        try {
            await this.diaryModel.deleteMany({ userId: userId })
            return { message: "All diary deleted!" };
        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    private checkdiaryContent (diaryContent: IdiaryContent): void  {
        if (diaryContent?.content.length <= 0) {
            throw new Error("No Diary parametor");
        };
    };
}