import { IDiary, IdiaryContent, IfindByDateDTO } from '@/interfaces/IDiary';
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

    // 내용 변경시 오늘자 미리 썼던 내용이 에디터 창에 미리 적어져 있어야 한다.
    /**
     * 생성 날짜가 '오늘'을 지나지 않았으면 내용만 수정된다. 
     */
    public async createDiaryContent(userId: string, diaryContent: IdiaryContent) { //만들어야 됨
        try {
            //await this.diaryModel.deleteMany() //지울것!!
            this.checkdiaryContent(diaryContent)
            // 날짜가 '오늘'이라면 중복되지 말아야 한다.
            // findandupdate로 오늘이 지난게 아니면 수정으로 바뀌게끔

            const contentSubject = diaryContent.subject.length !== 0 ? diaryContent.subject : ""
            const contentBody = diaryContent.content;
            const date = new Date() //now랑 비교해서 날짜 안바뀌었으면 추가안되게
            const getKRDate = () => {
                const date = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
                const dateSplitArr = date.split('. ') // 공백문자도 포함해 분리
                return {
                    year: dateSplitArr[0],
                    month: dateSplitArr[1].padStart(2, '0'),
                    day: dateSplitArr[2].padStart(2, '0')
                }
            };
            const dateKR = getKRDate();

            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId: userId,
                subject: contentSubject,
                content: contentBody,
                year: dateKR.year,
                month: dateKR.month,
                day: dateKR.day
            });
            await diaryRecord.save();

            return { message: 'saved' };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    /**
     * 페이지네이션 적용. 용도와 달라질 수 있어서 함수명 변경가능성 있음. 스크롤 내릴때마다 이어지는 내용을 찾는다
     */
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

    /**
     * 맨처음 다이어리 구성시 일주일치 불러오기. 다이어리 생성되면 '새 다이어리-1주일치 순'
     */
    public async weekleyDiary(userId: string) {
        try {
            //페이지네이션 이용해서 끊기
            const diaryRecord = await this.diaryModel.find({ id: userId }).limit(7).sort({ createdAt: -1 });
            
            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };

            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });

            return diaryForm;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async getDiary(userId: string, lastDiaryId: string) {
        try {
            //페이지네이션 이용해서 끊기
            if (!lastDiaryId) {
                throw new Error('Paginate is need last Id');
            };
            //{'_id'>lastId}
            //userId: userId
            const diaryRecord = await this.diaryModel.find().and([{ userId: userId }, { '_id': { '$lt': lastDiaryId } }]).limit(7).sort({ createdAt: -1 });
            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };

            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });

            return diaryForm;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findKeyword(userId: string, keyword: string) {
        try {
            //키워드 연결은 + 사용
            //유저아이디로 필터링해야함
            const diaryRecord = await this.diaryModel.find().and([{ userId: userId }, { $text: { $search: keyword } }])

            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };
            
            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });

            return diaryForm;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findByDate(userId: string, findByDateDTO: IfindByDateDTO) {
        //targetDate 서식 정해야함.
        try {

            //const diaryRecord = await this.diaryModel.find({id:userId, created_at:targetDate});
            const diaryRecord = await this.diaryModel.find({ userId: userId })
                .lte('year', findByDateDTO.year)
                .lte('month', findByDateDTO.month)
                .lte('day', findByDateDTO.day)

            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };

            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });

            return diaryForm;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findDiaryCount(userId: string) {
        try {
            const diaryCount = await this.diaryModel.find({ userId: userId }).count();
            if (!diaryCount) {
                throw new Error('Diary is Empty');
            };
            return diaryCount
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }
    /**
     * 회원탈퇴 때 사용
     */
    public async deleteAllDiary(userId: string) {
        try {
            await this.diaryModel.deleteMany({ userId: userId })
            return { message: "All diary deleted!" };
        } catch (error) {
            this.logger.error(error);
            return error;
        };
    };

    private checkdiaryContent(diaryContent: IdiaryContent): void {
        if (diaryContent?.content.length <= 0) {
            throw new Error("No Diary parametor");
        };
    };

    private setDiaryForm(rawDiary: any) {
        const diaryId = String(rawDiary._id).split('"');
        const diaryYear = String(rawDiary.year);
        const diaryMonth = String(rawDiary.month).padStart(2, '0');
        const diaryDay = String(rawDiary.day).padStart(2, '0');

        const diaryForm = {
            id: diaryId[0],
            subject: rawDiary.subject ? rawDiary.subject : '',
            content: rawDiary.content ? rawDiary.content : '',
            date: `${diaryYear}-${diaryMonth}-${diaryDay}`
        }

        return diaryForm
    }
}