import Diary from '../../models/diary'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import JwtUtil from "../utils/jwtUtils";
import DiaryService from "./diary.service";
import { Query } from 'mongoose';
import { appendFile } from 'fs';

describe('DiaryService', () => {
    let service: DiaryService;

    beforeEach(() => {
        service = new DiaryService(Diary, logger)
    })
    describe('createDiaryContent', () => {
        const userId = 'testUserId';
        const diaryContent = { subject: 'test subject', content: 'test content' };

        it('diaryContent를 전송하지 않는다면 No Diary parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, null);
            } catch (error) {
                expect(error).toEqual(new Error('No Diary parametor'));
            };
        });

        it('diaryContent의 length가 0이면 No Diary parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, { ...diaryContent, subject: '', content: '' });
            } catch (error) {
                expect(error).toEqual(new Error('No Diary parametor'));
            };
        });

        it('당일 다이어리가 이미 있으면 업데이트 한다.', async () => {
            Diary.findOne = jest.fn().mockReturnValue({
                and: jest.fn().mockResolvedValue({_id:'diaryId'})
            })
            Diary.updateOne = jest.fn().mockResolvedValue('Diary update');

            const result = await service.createDiaryContent(userId, diaryContent);

            expect(result).toEqual({ message: 'Diary update' });
        });

        it("subject의 길이가 0이면 제목이 ''이여야 한다.", async () => {
            
            Diary.findOne = jest.fn().mockReturnValue({
                and: jest.fn()
            })
            
            jest.spyOn(Diary.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ message: 'saved' }))
            const result = await service.createDiaryContent(userId, {...diaryContent, subject:''});

            expect(result).toEqual({ message: 'Diary save' });
        });

        it('올바른 userId와 diaryContent를 전송하면 saved를 반환해야 한다.', async () => {
            
            Diary.findOne = jest.fn().mockReturnValue({
                and: jest.fn()
            })

            jest.spyOn(Diary.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ message: 'saved' }))
            const result = await service.createDiaryContent(userId, diaryContent);

            expect(result).toEqual({ message: 'Diary save' });
        });
    });

    describe('findAllDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2'
            }
        ];
        it('다이어리를 검색해서 아무것도 나오지 않는다면 Diary is Empty를 반환해야 한다.', async () => { //이거 수정가능성 높음
            try {
                Diary.find = jest.fn().mockResolvedValue(undefined)
                const result = await service.findAllDiary(userId);
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId를 전송하면 올바른 결과를 반환해야 한다.', async () => { //이거 수정가능성 높음
            Diary.find = jest.fn().mockResolvedValue(diaryContentArr)
            const result = await service.findAllDiary(userId);

            expect(result).toEqual(diaryContentArr);
        });
    });

    describe('findKeyword', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: new Object("a1"),
                subject: 'subject1',
                content: 'content1',
                year:2022,
                month:9,
                day:26,
            },
            {
                _id: new Object("b2"),
                subject: 'subject2',
                content: 'content2',
                year:2022,
                month:9,
                day:25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date:'2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date:'2022-09-25'
            }
        ];
        const testKeyword = 'keyword'
        it('다이어리를 검색해서 아무것도 나오지 않는다면 Diary is Empty를 반환해야 한다.', async () => { //이거 수정가능성 높음
            try {
                Diary.find = jest.fn().mockReturnValue({
                    and: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(undefined)
                    })
                });
                const result = await service.findKeyword(userId, testKeyword);
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId와 키워드를 전송하면 올바른 결과를 반환해야 한다.', async () => { 
            Diary.find = jest.fn().mockReturnValue({
                and: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(diaryContentArr)
                })
            });
            const result = await service.findKeyword(userId, testKeyword);

            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('findByDate', () => {
        const userId = 'testUserId';
        const testDate = {
            year: 2022,
            month: 9,
            day: 26
        }
        const diaryContentArr = [
            {
                _id: new Object("a1"),
                subject: 'subject1',
                content: 'content1',
                year:2022,
                month:9,
                day:26,
            },
            {
                _id: new Object("b2"),
                subject: 'subject2',
                content: 'content2',
                year:2022,
                month:9,
                day:25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date:'2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date:'2022-09-25'
            }
        ];
        
        it('다이어리를 검색해서 아무것도 나오지 않는다면 Diary is Empty를 반환해야 한다.', async () => { //이거 수정가능성 높음
            try {
                Diary.find = jest.fn().mockReturnValue({
                    lte: jest.fn().mockReturnValue({
                        lte: jest.fn().mockReturnValue({
                            lte: jest.fn().mockReturnValue({
                                sort: jest.fn().mockResolvedValue(undefined)
                            })
                        })
                    })
                });
                const result = await service.findByDate(userId, testDate);
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId와 date를 전송하면 올바른 결과를 반환해야 한다.', async () => { 
            Diary.find = jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                    lte: jest.fn().mockReturnValue({
                        lte: jest.fn().mockReturnValue({
                            sort: jest.fn().mockResolvedValue(diaryContentArr)
                        })
                    })
                })
            });
            const result = await service.findByDate(userId, testDate);

            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('findDiaryCount', () => {
        
        it('다이어리를 검색해서 아무것도 나오지 않는다면 숫자 0을 반환해야 한다.', async () => { 
            Diary.find = jest.fn().mockReturnValue({
                count: jest.fn().mockResolvedValue(undefined)
            });
            const result = await service.findDiaryCount('userId');
            expect(result).toEqual(0);
        });

        it('올바른 userId를 전송하면 다이어리의 수를 반환 한다.', async () => {
            Diary.find = jest.fn().mockReturnValue({
                count: jest.fn().mockResolvedValue(2)
            });
            const result = await service.findDiaryCount('userId');

            expect(result).toEqual(2);
        });
    });

    describe('weekleyDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: new Object("a1"),
                subject: 'subject1',
                content: 'content1',
                year:2022,
                month:9,
                day:26,
            },
            {
                _id: new Object("b2"),
                subject: 'subject2',
                content: 'content2',
                year:2022,
                month:9,
                day:25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date:'2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date:'2022-09-25'
            }
        ];
        it('다이어리를 검색해서 아무것도 나오지 않는다면 Diary is Empty를 반환해야 한다.', async () => { 
            try {
                Diary.find = jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(undefined)
                    })
                });
                const result = await service.weekleyDiary(userId);
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId를 전송하면 diary form을 반환 한다.', async () => {
            Diary.find = jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(diaryContentArr)
                })
            })
            const result = await service.weekleyDiary(userId);

            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('getDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: new Object("a1"),
                subject: 'subject1',
                content: 'content1',
                year:2022,
                month:9,
                day:26,
            },
            {
                _id: new Object("b2"),
                subject: 'subject2',
                content: 'content2',
                year:2022,
                month:9,
                day:25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date:'2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date:'2022-09-25'
            }
        ];
        it('lastDiaryId를 입력하지 않는다면 Paginate is need last Id 에러를 반환해야 한다.', async () => { 
            try {
                const result = await service.getDiary(userId, '');
            } catch (error) {
                expect(error).toEqual(new Error('Paginate is need last Id'));
            };
        });

        it('검색 결과가 없을 경우 Diary is Empty를 반환 한다.', async () => {
            try {
                Diary.find = jest.fn().mockReturnValue({
                    and: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            sort: jest.fn().mockResolvedValue(undefined)
                        })
                    })
                });
                const result = await service.getDiary(userId, 'lastId');
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId와 lastDiaryId를 전송하면 diary form을 반환 한다.', async () => {
            Diary.find = jest.fn().mockReturnValue({
                and: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(diaryContentArr)
                    })
                })
            });

            const result = await service.getDiary(userId, 'lastId');

            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('deleteAllDiary', () => {
        const userId = 'testUserId';

        it('올바른 userId를 전송하면 All diary deleted를 반환해야 한다.', async () => { //이거 수정가능성 높음
            Diary.deleteMany = jest.fn()
            const result = await service.deleteAllDiary(userId);

            expect(result.message).toEqual('All diary deleted!');
        });
    });

})