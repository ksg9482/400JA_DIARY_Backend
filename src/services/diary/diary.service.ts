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
            //await this.diaryModel.deleteMany() //지울것!!
            this.checkdiaryContent(diaryContent)
            // 날짜가 '오늘'이라면 중복되지 말아야 한다.
            
            const contentSubject = diaryContent.subject.length !== 0 ? diaryContent.subject : ""
            const contentBody = diaryContent.content;
            const date = new Date() //now로 바꿔서 넣어야 함
            const getKRDate = () => {
                const date = new Date().toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})
                const dateSplitArr = date.split('. ') // 공백문자도 포함해 분리
                return {
                    year:dateSplitArr[0],
                    month:dateSplitArr[1].padStart(2,'0'),
                    day:dateSplitArr[2].padStart(2,'0')
                }
            };
            const dateKR = getKRDate()
            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId: userId,
                subject: contentSubject,
                content: contentBody,
                year:dateKR.year,
                month:dateKR.month,
                day:dateKR.day
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
                throw new Error('Diary is Empty');
            };

            return diaryRecord;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findKeyword(userId: string, keyword: string) {
        try {
            //키워드 연결은 + 사용
            //유저아이디로 필터링해야함
            const diaryRecord = await this.diaryModel.find({$text:{$search:keyword}});

            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };
            //console.log([...diaryRecord])
            return diaryRecord
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findByDate(userId: string, targetDate: Date) {
        //targetDate 서식 정해야함.
        try {
            //const diaryRecord = await this.diaryModel.find({id:userId, created_at:targetDate});
            const diaryRecord = await this.diaryModel.find()
                .all([{id:userId},{year:2022}])
            
                if (!diaryRecord) {
                throw new Error('Diary is Empty');
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