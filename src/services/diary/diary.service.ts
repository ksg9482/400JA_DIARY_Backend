import { IDiary, IdiaryContent, IfindByDateDTO } from '@/interfaces/IDiary';
import { Logger } from 'winston'; //@로 표기했었음. jest오류

import { HydratedDocument } from 'mongoose';

interface BaseOutput {
    error?: any
}
interface IDiaryForm {
    id: string;
    subject: any;
    content: any;
    date: string;
}
interface IdiaryOutput extends BaseOutput {
    end?: boolean;
    list?: IDiaryForm[];
}
interface IError {
    name: string;
    message: string;
}

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
            if (diaryContent?.content.length <= 0) {
                throw new Error("No Diary parametor");
            };

            const contentSubject = diaryContent.subject.length !== 0 ? diaryContent.subject : ""

            const contentBody = diaryContent.content;

            const dateKR = this.getKRDate();

            const diaryRecord: HydratedDocument<IDiary> = new this.diaryModel({
                userId: userId,
                subject: contentSubject,
                content: contentBody,
                year: dateKR.year,
                month: dateKR.month,
                day: dateKR.day
            });


            const nowDiary = await this.diaryModel //object or null
                .findOne({ userId: userId })
                .and([
                    { year: Number(dateKR.year) },
                    { month: Number(dateKR.month) },
                    { day: Number(dateKR.day) }
                ])
            if (nowDiary) {
                await this.diaryModel.updateOne(
                    { _id: nowDiary['_id'] }, //filter
                    {
                        subject: contentSubject, //update
                        content: contentBody,
                    }
                )
                //await diaryRecord.updateOne({userId:userId})
                return { message: 'Diary update' };
            }
            await diaryRecord.save();

            return { message: 'Diary save' };
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
            const diaryRecord = await this.diaryModel.find({ userId: userId });

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
    // public async weekleyDiary(userId: string): Promise<IdiaryOutput> {
    //     try {
    //         const getDiaryRecord = async (userId: string): Promise<IDiary[] | { error: any }> => {
    //             try {
    //                 if (!userId || userId.length <= 0) {
    //                     this.throwError('Invalid userId');
    //                 };
    //                 const diaryRecord = await this.diaryModel.find({ userId: userId }).limit(7).sort({ createdAt: -1 });
    //                 if (diaryRecord.length <= 0) {
    //                     this.throwError('Empty Diary');
    //                 }
    //                 const setDiaryForm = (diary: any) => {
    //                     return {
    //                         _id: diary._id,
    //                         userId: diary.userId,
    //                         subject: diary.subject,
    //                         content: diary.content,
    //                         year: diary.year,
    //                         month: diary.month,
    //                         day: diary.day,
    //                     }
    //                 }
    //                 //뭐 하나 없거나 잘못되면 그것도 에러로 빼야 됨
    //                 const output: IDiary[] = diaryRecord.map(setDiaryForm)

    //                 return output;
    //             } catch (error) {
    //                 return { error: error }
    //             }
    //         };
    //         const setDiaryForm = async (diaryRecord: Promise<IDiary[]>): Promise<IDiaryForm[] | { error: any }> => {
    //             try {
    //                 const targetDiaryRecord = await diaryRecord;
    //                 if (!targetDiaryRecord || targetDiaryRecord.length <= 0) {
    //                     this.throwError('Invalid setDiaryForm input');
    //                 };

    //                 const output = targetDiaryRecord.map((diary) => {
    //                     return this.setDiaryForm(diary)
    //                 });
    //                 return output
    //             } catch (error) {
    //                 return error
    //             }
    //         };
    //         const setDiaryEnd = async (diarys: Promise<IDiaryForm[]>): Promise<IdiaryOutput> => {
    //             try {
    //                 let diaryIsEnd = false;

    //                 const targetDiarys = await diarys;
    //                 if (!targetDiarys || targetDiarys.length <= 0) {
    //                     this.throwError('Invalid setDiaryEnd input');
    //                 };

    //                 const length = targetDiarys.length;
    //                 if (length < 7) {
    //                     diaryIsEnd = true;
    //                 }

    //                 const diaryOutput = targetDiarys;
    //                 return { end: diaryIsEnd, list: diaryOutput };
    //             } catch (error) {
    //                 return error
    //             }

    //         }

    //         const funcs = [getDiaryRecord, setDiaryForm, setDiaryEnd];

    //         return await this.diaryPipe(funcs, userId);
    //     } catch (error) {
    //         this.logger.error(error);
    //         return error;
    //     }
    // };

    public async getDiary(userId: string, lastDiaryId?: string): Promise<IdiaryOutput> {
        try {
            if (!userId || userId.length <= 0) {
                this.throwError('Invalid userId', 'inputError');
            };
            if (lastDiaryId?.length <= 0) {
                this.throwError('Invalid lastDiaryId', 'inputError');
            };
            const getDiaryRecord = async (userId: string, lastDiaryId?: string): Promise<IDiary[] | { error: any }> => {
                try {
                    const diaryRecord = await this.diaryModel
                        .find()
                        .and(lastDiaryId
                            ? [
                                { userId: userId },
                                { '_id': { '$lt': lastDiaryId } }
                            ]
                            : [
                                { userId: userId }
                            ])
                        .limit(7)
                        .sort({ createdAt: -1 });

                    if (!diaryRecord || diaryRecord.length <= 0) {
                        this.throwError('DiaryRecord is Empty');
                    }
                    const setDiaryMap = (diary: any) => {
                        return {
                            _id: diary._id,
                            userId: diary.userId,
                            subject: diary.subject,
                            content: diary.content,
                            year: diary.year,
                            month: diary.month,
                            day: diary.day,
                        }
                    }
                    //뭐 하나 없거나 잘못되면 그것도 에러로 빼야 됨
                    const output: IDiary[] = diaryRecord.map(setDiaryMap)

                    return output;
                } catch (error) {
                    return { error: error }
                }
            };
            const setDiaryForm = async (diaryRecord: Promise<IDiary[]>): Promise<IDiaryForm[] | { error: any }> => {
                const targetDiaryRecord = await diaryRecord;
                const output = targetDiaryRecord.map((diary) => {
                    return this.setDiaryForm(diary)
                });
                return output;
            };
            const setDiaryEnd = async (diarys: Promise<IDiaryForm[]>): Promise<IdiaryOutput | { error: any }> => {
                let diaryIsEnd = false;

                const targetDiarys = await diarys;
                const length = targetDiarys.length;
                if (length < 7) {
                    diaryIsEnd = true;
                }

                const diaryOutput = targetDiarys;
                return { end: diaryIsEnd, list: diaryOutput };


            }

            const funcs = [getDiaryRecord, setDiaryForm, setDiaryEnd];
            const result = await this.diaryPipe(funcs, userId);
            return result
        } catch (error) {
            this.logger.error(error);
            return { error: error };
        }
    };

    public async findKeyword(userId: string, keyword: string): Promise<IdiaryOutput> {
        try {
            //키워드 연결은 + 사용
            //유저아이디로 필터링해야함
            const diaryRecord = await this.diaryModel
                .find()
                .and([
                    { userId: userId },
                    { $text: { $search: keyword } }
                ])
                .sort({ createdAt: -1 });

            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };

            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });
            let diaryIsEnd = false;
            if (diaryForm.length < 7) {
                diaryIsEnd = true;
            }
            return { end: diaryIsEnd, list: diaryForm };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findByDate(userId: string, findByDateDTO: IfindByDateDTO): Promise<IdiaryOutput> {
        try {
            //const diaryRecord = await this.diaryModel.find({id:userId, created_at:targetDate});
            const diaryRecord = await this.diaryModel.find({ userId: userId })
                .lte('year', findByDateDTO.year)
                .lte('month', findByDateDTO.month)
                .lte('day', findByDateDTO.day)
                .sort({ createdAt: -1 });

            if (!diaryRecord) {
                throw new Error('Diary is Empty');
            };

            const diaryForm = [...diaryRecord].map((diary) => { return this.setDiaryForm(diary) });
            let diaryIsEnd = false;
            if (diaryForm.length < 7) {
                diaryIsEnd = true;
            }
            return { end: diaryIsEnd, list: diaryForm };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    public async findDiaryCount(userId: string) {
        const diaryCount = await this.diaryModel.find({ userId: userId }).count();
        if (!diaryCount) {
            return 0;
        };
        return diaryCount;
    }
    /**
     * 회원탈퇴 때 사용
     */
    public async deleteAllDiary(userId: string) {
        await this.diaryModel.deleteMany({ userId: userId })
        return { message: "All diary deleted!" };
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
        const diaryId = String(rawDiary._id).split('"');
        const diaryYear = String(rawDiary.year);
        const diaryMonth = String(rawDiary.month).padStart(2, '0');
        const diaryDay = String(rawDiary.day).padStart(2, '0');

        const diaryForm = {
            id: diaryId[0],
            subject: rawDiary.subject,
            content: rawDiary.content,
            date: `${diaryYear}-${diaryMonth}-${diaryDay}`
        }

        return diaryForm
    }

    private async diaryPipe([...funcs]: Function[], firstValue: any) {
        //reduce도 있지만 에러 검출시 파이프라인을 멈추기 힘들어서 for loop 사용.
        try {
            let result: any = firstValue;
            for (let func of funcs) {
                let temp = await func(result);
                if (temp.error) {
                    this.throwError(temp.error.message, `${func.name}Error`)
                };
                result = temp;
            }
            return result;
        } catch (error) {
            console.log(error)
            return { error: error }
        }
    }

    private throwError(errormessage: string, errorName?: string) {
        let err = new Error();
        if (errorName) {
            err.name = errorName
        }
        err.message = errormessage;
        throw err;
    }
}