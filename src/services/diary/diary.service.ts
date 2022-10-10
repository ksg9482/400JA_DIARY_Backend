import { IDiary, IdiaryContent, IfindByDateDTO } from '@/interfaces/IDiary';
import { Logger } from 'winston'; //@로 표기했었음. jest오류

import { HydratedDocument } from 'mongoose';

interface BaseOutput {
    error?: any
};
interface IDiaryForm extends BaseOutput {
    id?: string;
    subject?: any;
    content?: any;
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
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };

            if (!diaryContentObj || !diaryContentObj.content) {
                throw new Error('Invalid Diary parametor');
            };

            const dateKR = this.getKRDate();
            const setDiarySaveForm = (setDiarySaveFormInput: { userId: string, diaryContentObj: IdiaryContent }) => {
                const userId = setDiarySaveFormInput.userId;
                const diarySubject = setDiarySaveFormInput.diaryContentObj.subject || '';
                const diaryContent = setDiarySaveFormInput.diaryContentObj.content;

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
            const diarySave = async (diaryRecord: HydratedDocument<IDiary>) => {

                const nowDiary = await this.diaryModel //object or null
                    .findOne({ userId: diaryRecord.userId })
                    .and([
                        { year: Number(dateKR.year) },
                        { month: Number(dateKR.month) },
                        { day: Number(dateKR.day) }
                    ])

                if (nowDiary) {
                    const test = await this.diaryModel.updateOne(
                        { _id: nowDiary['_id'] }, //filter
                        {
                            subject: diaryRecord.subject, //update
                            content: diaryRecord.content,
                        }
                    )
                    return { message: 'Diary update' };
                }

                await diaryRecord.save();
                return { message: 'Diary save' };
            };

            const funcs = [setDiarySaveForm, diarySave];
            const firstValue = { userId, diaryContentObj };
            const result = await this.functionPipe(funcs, { ...firstValue });
            return result;
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async getDiary(userId: string): Promise<IdiaryOutput> {
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };
            const getDiaryRecord = async (userId: string): Promise<IDiaryForm[]> => {
                try {
                    const diaryRecord = await this.diaryModel
                        .find({ userId: userId })
                        .limit(7)
                        .sort({ createdAt: -1 });

                    if (!diaryRecord) {
                        throw new Error('Get diary fail');
                    }

                    if (diaryRecord.length <= 0) {
                        return []
                    }


                    const output = diaryRecord.map(this.setDiaryForm);

                    return output;
                } catch (error) {
                    return error
                }
            };

            const funcs = [getDiaryRecord, this.setDiaryEnd];
            const firstValue = { userId: userId };
            const result = await this.functionPipe(funcs, { ...firstValue });
            return result
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async getDiary_test(userId: string): Promise<IdiaryOutput> {
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };
            const getDiaryRecord = async (userId: string) => {
                try {
                    const diaryRecord = await this.diaryModel
                        .find({ userId: userId })
                        .limit(7)
                        .sort({ createdAt: -1 });

                    if (!diaryRecord) {
                        throw new Error('Get diary fail');
                    }

                    if (diaryRecord.length <= 0) {
                        return []
                    }
                    
                    return diaryRecord;
                } catch (error) {
                    return error
                }
            };
            const setDiaryEnd = (diarys: IDiaryForm[]): IdiaryOutput =>{
                let diaryIsEnd = false;
        
                const length = diarys.length;
                if (length < 7) {
                    diaryIsEnd = true;
                }
        
                return { end: diaryIsEnd, list: diarys };
            };

            const diaryRecord = (await getDiaryRecord(userId)).map(this.setDiaryForm);
            const diaryForm = setDiaryEnd(diaryRecord)

            return diaryForm
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async getLastIdDiary(userId: string, lastDiaryId: string): Promise<IdiaryOutput> {
        try {
            if (!userId) {
                throw new Error('Invalid userId')
            };
            if (!lastDiaryId) {
                throw new Error('Invalid lastDiaryId')
            };
            const getDiaryRecord = async (getDiaryRecordInput: { userId: string, lastDiaryId?: string }): Promise<IDiaryForm[] | { error: any }> => {
                const userId = getDiaryRecordInput.userId;
                const lastDiaryId = getDiaryRecordInput.lastDiaryId;
                try {
                    const diaryRecord = await this.diaryModel
                        .find()
                        .and([
                            { userId: userId },
                            { '_id': { '$lt': lastDiaryId } }
                        ])
                        .limit(7)
                        .sort({ createdAt: -1 });
                        if (!diaryRecord) {
                            throw new Error('Get diary fail')
                        }
    
                        if (diaryRecord.length <= 0) {
                            return []
                        }
                        
                    const output = diaryRecord.map(this.setDiaryForm)

                    return output;
                } catch (error) {
                    return error
                }
            };

            const funcs = [getDiaryRecord, this.setDiaryEnd];
            const firstValue = { userId, lastDiaryId };
            const result = await this.functionPipe(funcs, { ...firstValue });
            return result
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    public async findKeyword(userId: string, keyword: string): Promise<IdiaryOutput> {
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };
            if (!keyword) {
                throw new Error('Invalid keyword');
            };
            const getDiaryRecord = async (getDiaryRecordInput: { userId: string, keyword: string }): Promise<IDiaryForm[] | { error: any }> => {
                const userId = getDiaryRecordInput.userId;
                try {
                    const diaryRecord = await this.diaryModel
                        .find()
                        .and([
                            { userId: userId },
                            { $text: { $search: keyword } }
                        ])
                        .sort({ createdAt: -1 });

                        if (!diaryRecord) {
                            throw new Error('Get diary fail');
                        }
    
                        if (diaryRecord.length <= 0) {
                            return []
                        }
                    const output = diaryRecord.map(this.setDiaryForm)

                    return output;
                } catch (error) {
                    return error
                }
            };
            //
            const funcs = [getDiaryRecord, this.setDiaryEnd];
            const firstValue = { userId, keyword };
            const result = await this.functionPipe(funcs, { ...firstValue });
            return result
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findByDate(userId: string, targetDate: string): Promise<IdiaryOutput> {
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };
            if (!targetDate) {
                throw new Error('Invalid targetDate');
            };
            const getDiaryRecord = async (getDiaryRecordInput: { userId: string, targetDate:string }): Promise<IDiaryForm[] | { error: any }> => {
                const userId = getDiaryRecordInput.userId;
                try {
                    const diaryRecord = await this.diaryModel.find({ userId: userId })
                        .lte('createdAt', new Date(targetDate))
                        .sort({ createdAt: -1 });
                        if (!diaryRecord) {
                            throw new Error('Get diary fail');
                        }
    
                        if (diaryRecord.length <= 0) {
                            return []
                        }

                    const output = diaryRecord.map(this.setDiaryForm);

                    return output;
                } catch (error) {
                    return error
                }
            };
            const funcs = [getDiaryRecord, this.setDiaryEnd];
            const firstValue = { userId, targetDate };
            const result = await this.functionPipe(funcs, { ...firstValue });
            return result
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findDiaryCount(userId: string) {
        try {
            if (!userId) {
                throw new Error('Invalid userId');
            };

            const diaryCount = await this.diaryModel.find({ userId: userId }).count();
            if (!diaryCount) {
                return { count: 0 };
            };
            return { count: diaryCount };
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
            if (!userId) {
                throw new Error('Invalid userId');
            };
            await this.diaryModel.deleteMany({ userId: userId })
            return { message: "All diary deleted!" };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    };

    private getKRDate() {
        const date = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
        const dateSplitArr = date.split('. ') // 공백문자도 포함해 분리
        return {
            year: dateSplitArr[0],
            month: dateSplitArr[1].padStart(2, '0'),
            day: dateSplitArr[2].padStart(2, '0')
        }
    }

    private setDiaryForm(rawDiary: any) {
        const diaryId = rawDiary._id;
        const diaryYear = String(rawDiary.year);
        const diaryMonth = String(rawDiary.month).padStart(2, '0');
        const diaryDay = String(rawDiary.day).padStart(2, '0');

        const diaryForm = {
            id: diaryId,
            subject: rawDiary.subject,
            content: rawDiary.content,
            date: `${diaryYear}-${diaryMonth}-${diaryDay}`
        }

        return diaryForm
    }

    private async setDiaryEnd(diarys: Promise<IDiaryForm[]>): Promise<IdiaryOutput> {
        let diaryIsEnd = false;

        const targetDiarys = (await diarys);
        const length = targetDiarys.length;
        if (length < 7) {
            diaryIsEnd = true;
        }

        return { end: diaryIsEnd, list: targetDiarys };
    };

    private async functionPipe([...funcs]: Function[], firstValue: any) {
        //reduce도 있지만 에러 검출시 파이프라인을 멈추기 힘들어서 for loop 사용.
        try {
            let result: any = firstValue;
            for (let func of funcs) {
                let temp = await func(result);
                if (temp.error) {
                    let err = new Error();
                    err.name = `${func.name}Error`;
                    err.message = temp.error.message;
                    throw err;
                    //this.throwError(temp.error.message, `${func.name}Error`);
                };
                result = temp;
            }
            return result;
        } catch (error) {
            return error
        }
    }

    // private throwError(errormessage: string, errorName?: string) {
    //     let err = new Error();
    //     if (errorName) {
    //         err.name = errorName
    //     }
    //     err.message = errormessage;
    //     throw err;
    // }
}