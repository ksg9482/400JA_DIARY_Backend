import { IDiary, IdiaryContent, IfindByDateDTO } from '@/interfaces/IDiary';
import { Logger } from 'winston'; //@로 표기했었음. jest오류

import { HydratedDocument } from 'mongoose';

interface BaseOutput {
    error?: any
};
interface IDiaryForm extends BaseOutput {
    id?: string;
    subject?: string;
    content?: string;
    date?: string;
};
interface IdiaryOutput extends BaseOutput {
    end?: boolean;
    list?: IDiaryForm[];
};

export default class DiaryService {
    diaryModel: Models.DiaryModel;
    logger: Logger;

    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(diaryModel: Models.DiaryModel, logger: Logger) {
        this.diaryModel = diaryModel;
        this.logger = logger;
    };

    public async createDiaryContent(userId: string, diaryContentObj: IdiaryContent) { //만들어야 됨
        if (!userId) {
            throw new Error('Bad userId parametor');
        };

        if (!diaryContentObj || !diaryContentObj.content) {
            throw new Error('Bad Diary parametor');
        };

        const dateKR = this.getKRDate();
        const setDiaryRecord = (userId: string, diaryContentObj: IdiaryContent) => {
            const diarySubject = diaryContentObj.subject;
            const diaryContent = diaryContentObj.content;

            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId: userId,
                subject: diarySubject,
                content: diaryContent,
                year: Number(dateKR.year),
                month: Number(dateKR.month),
                day: Number(dateKR.day)
            });
            return diaryRecord
        };
        const getTodayDiary = async (userId: string, dateKR: { year: string, month: string, day: string; }) => {
            const nowDiary = await this.diaryModel //object or null
                .findOne({ userId: userId })
                .and([
                    { year: Number(dateKR.year) },
                    { month: Number(dateKR.month) },
                    { day: Number(dateKR.day) }
                ]);
            return nowDiary;
        };

        const updateTodayDiary = async (diaryRecord: HydratedDocument<IDiary>) => {
            const diaryUpdate = await this.diaryModel.updateOne(
                { _id: diaryRecord['_id'] }, //filter
                {
                    subject: diaryRecord.subject, //update
                    content: diaryRecord.content,
                }
            );
            return diaryUpdate;
        };

        const diarySave = async (diaryRecord: HydratedDocument<IDiary>) => {
            const todayDiary = await getTodayDiary(userId, dateKR)
            if (todayDiary) {
                updateTodayDiary(todayDiary);
                return { message: 'Diary update' }
            };

            await diaryRecord.save();
            return { message: 'Diary save' };
        };
        const diaryRecord = diarySave(setDiaryRecord(userId, diaryContentObj));

        return diaryRecord;
    };

    public async getDiary(userId: string) {
        if (!userId) {
            throw new Error('Bad userId parametor');
        };
        const getDiaryRecord = async (userId: string) => {
            const diaryRecord = await this.diaryModel
                    .find({ userId: userId })
                    .limit(7)
                    .sort({ createdAt: -1 });

                if (!diaryRecord) { //500
                    throw new Error('Get diary fail');
                };

                return diaryRecord;
        };
        const diarys = (await getDiaryRecord(userId)).map(this.setDiaryForm);
        const getDiaryOutput = this.setDiaryEnd(diarys);

        return getDiaryOutput;
    };


    public async getLastIdDiary(userId: string, lastDiaryId: string): Promise<IdiaryOutput> {
        if (!userId) {
            throw new Error('Bad userId parametor')
        };
        if (!lastDiaryId) {
            throw new Error('Bad lastDiaryId parametor')
        };
        const getDiaryRecord = async (userId: string, lastDiaryId: string) => {
            const diaryRecord = await this.diaryModel
                    .find()
                    .and([
                        { userId: userId },
                        { '_id': { '$lt': lastDiaryId } }
                    ])
                    .limit(7)
                    .sort({ createdAt: -1 });
                    
                if (!diaryRecord) { //500
                    throw new Error('Get diary fail')
                };

                return diaryRecord;
        };

        const diarys = (await getDiaryRecord(userId, lastDiaryId)).map(this.setDiaryForm);
        const getLastIdDiaryOutput = this.setDiaryEnd(diarys);
        return getLastIdDiaryOutput;
    };

    public async findKeyword(userId: string, keyword: string): Promise<IdiaryOutput> {
        if (!userId) {
            throw new Error('Bad userId parametor');
        };
        if (!keyword) {
            throw new Error('Bad keyword parametor');
        };
        const getDiaryRecord = async (userId: string, keyword: string) => {
            const diaryRecord = await this.diaryModel
                    .find()
                    .and([
                        { userId: userId },
                        { $text: { $search: keyword } }
                    ])
                    .sort({ createdAt: -1 });

                if (!diaryRecord) { //500
                    throw new Error('Get diary fail');
                };

                return diaryRecord;
        };
        const diarys = (await getDiaryRecord(userId, keyword)).map(this.setDiaryForm);
        const findKeywordOutput = this.setDiaryEnd(diarys);
        return findKeywordOutput;
    }

    public async findByDate(userId: string, targetDate: string) {
        if (!userId) {
            throw new Error('Bad userId parametor');
        };
        if (!targetDate) {
            throw new Error('Bad targetDate parametor');
        };
        const getDiaryRecord = async (userId: string, targetDate: string) => {
            const diaryRecord = await this.diaryModel.find({ userId: userId })
                    .lte('createdAt', new Date(targetDate))
                    .sort({ createdAt: -1 });
                if (!diaryRecord) {
                    throw new Error('Get diary fail');
                }

                if (diaryRecord.length <= 0) {
                    return []
                }

                return diaryRecord;
        };
        const diarys = (await getDiaryRecord(userId, targetDate)).map(this.setDiaryForm);
        const getDiaryOutput = this.setDiaryEnd(diarys);

        return getDiaryOutput;
    };

    public async findDiaryCount(userId: string) {
        if (!userId) {
            throw new Error('Bad userId parametor');
        };

        const diaryCount = await this.diaryModel.find({ userId: userId }).count();
        if (!diaryCount) {
            return { count: 0 };
        };
        return { count: diaryCount };
    };
    /**
     * 회원탈퇴 때 사용
     */
    public async deleteAllDiary(userId: string) {
        if (!userId) {
            throw new Error('Bad userId parametor');
        };
        await this.diaryModel.deleteMany({ userId: userId });
        return { message: "All diary deleted!" };
    };

    protected getKRDate() {
        const date = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
        const dateSplitArr = date.split('. ');// 공백문자도 포함해 분리
        return {
            year: dateSplitArr[0],
            month: dateSplitArr[1].padStart(2, '0'),
            day: dateSplitArr[2].padStart(2, '0')
        };
    };

    protected setDiaryForm(rawDiary: any) {
        const diaryId = rawDiary._id;
        const diaryYear = String(rawDiary.year);
        const diaryMonth = String(rawDiary.month).padStart(2, '0');
        const diaryDay = String(rawDiary.day).padStart(2, '0');

        const diaryForm = {
            id: diaryId,
            subject: rawDiary.subject,
            content: rawDiary.content,
            date: `${diaryYear}-${diaryMonth}-${diaryDay}`
        };
        return diaryForm;
    };

    private async setDiaryEnd(diarys: IDiaryForm[]) {
        let diaryIsEnd = false;

        const targetDiarys = diarys;
        const length = targetDiarys.length;
        if (length < 7) {
            diaryIsEnd = true;
        }

        return { end: diaryIsEnd, list: targetDiarys };
    };
};