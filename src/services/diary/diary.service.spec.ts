import Diary from '../../models/diary'
import logger from "../../loaders/logger";
import DiaryService from "./diary.service";

describe('DiaryService', () => {
    let service: DiaryService;

    beforeEach(() => {
        service = new DiaryService(Diary, logger)
    })
    describe('createDiaryContent', () => {
        const userId = 'userId';
        const diaryContent = { subject: 'test subject', content: 'test content' };

        it('userId가 없으면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(null, diaryContent);
            } catch (error) {
                expect(error.message).toEqual("Invalid userId");
            }
        });

        it('diaryContent를 전송하지 않는다면 Invalid Diary parametor를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, null);
            } catch (error) {
                expect(error.message).toEqual('Invalid Diary parametor');
            }
        });

        it('diaryContent의 length가 0이면 No Diary parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, { ...diaryContent, subject: '', content: '' });
            } catch (error) {
                expect(error.message).toEqual('Invalid Diary parametor');
            }
        });

        it('당일 다이어리가 이미 있으면 업데이트 한다.', async () => {
            const form = {
                userId: 'testUserId',
                subject: 'test subject',
                content: 'test content',
                year: 2022,
                month: 9,
                day: 30,
                _id: "63393305732d73ffbdcb93ca"
            }
            Diary.findOne = jest.fn().mockReturnValue({
                and: jest.fn().mockResolvedValue(form)
            })
            Diary.updateOne = jest.fn().mockResolvedValue({ message: 'Diary update' });
            jest.spyOn(Diary.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({}))
            const result = await service.createDiaryContent(userId, diaryContent);

            expect(result).toEqual({ message: 'Diary update' });
        });

        it("subject의 길이가 0이면 제목이 ''이여야 한다.", async () => {

            Diary.findOne = jest.fn().mockReturnValue({
                and: jest.fn()
            })

            jest.spyOn(Diary.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ message: 'saved' }))
            const result = await service.createDiaryContent(userId, { ...diaryContent, subject: '' });

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

    describe('findKeyword', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: "a1",
                subject: 'subject1',
                content: 'content1',
                year: 2022,
                month: 9,
                day: 26,
            },
            {
                _id: "b2",
                subject: 'subject2',
                content: 'content2',
                year: 2022,
                month: 9,
                day: 25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date: '2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date: '2022-09-25'
            }
        ];
        
        const findKeywordMockFunc = (returnValue:any) => {
            return Diary.find = jest.fn().mockReturnValue({
                and: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(returnValue)
                })
            });
        };

        it('userId가 없으면 Invalid userId를 반환해야 한다.', async () => {
            try {
                const result = await service.findKeyword(null, 'keyword');
            } catch (error) {
                expect(error.message).toEqual("Invalid userId")
            }
            
        });

        it('keyword의 length가 0이면 Invalid keyword를 반환해야 한다.', async () => {
            try {
                const result = await service.findKeyword(userId, '');
            } catch (error) {
                expect(error.message).toEqual("Invalid keyword")
            }
            
        });

        it('다이어리를 검색해서 아무것도 나오지 않는다면 빈 배열을 반환해야 한다.', async () => { //이거 수정가능성 높음
            findKeywordMockFunc([])
            const result = await service.findKeyword(userId, 'keyword');
            expect(result.list).toEqual([]);
        });

        it('검색에 실패하면 Get diary fail을 반환 한다.', async () => {
            findKeywordMockFunc(null)
            try {
                const result = await service.findKeyword(userId, 'keyword');
            } catch (error) {
                expect(error.message).toEqual('Get diary fail');
            }
            
        });

        it('올바른 userId와 키워드를 전송하면 올바른 결과를 반환해야 한다.', async () => {
            findKeywordMockFunc(diaryContentArr)
            const result = await service.findKeyword(userId, 'keyword');
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
                _id: "a1",
                subject: 'subject1',
                content: 'content1',
                year: 2022,
                month: 9,
                day: 26,
            },
            {
                _id: "b2",
                subject: 'subject2',
                content: 'content2',
                year: 2022,
                month: 9,
                day: 25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date: '2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date: '2022-09-25'
            }
        ];

        const findByDateMockFunc = (returnValue:any) => {
            return Diary.find = jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(returnValue)
                })
            });
        };

        it('userId가 없으면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
            const result = await service.findByDate(userId, '2022-10-01');
            } catch (error) {
                expect(error.message).toEqual("Invalid userId");
            }
        });

        it('findByDateDTO가 없으면 Invalid findByDateDTO 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.findByDate('testUserId', null);
            } catch (error) {
                expect(error.message).toEqual("Invalid targetDate")
            }
        });
       
        it('다이어리를 검색해서 아무것도 나오지 않는다면 빈 배열을 반환해야 한다.', async () => { //이거 수정가능성 높음
            findByDateMockFunc([])
            const result = await service.findByDate(userId, '2022-10-01');
            expect(result.list).toEqual([]);
        });

        it('검색에 실패하면 Get diary fail을 반환 한다.', async () => {
            findByDateMockFunc(null)
            try {
                const result = await service.findByDate(userId, '2022-10-01');
            } catch (error) {
                expect(error.message).toEqual('Get diary fail');
            }
        });

        it('올바른 userId와 date를 전송하면 올바른 결과를 반환해야 한다.', async () => {
            findByDateMockFunc(diaryContentArr);
            const result = await service.findByDate(userId, '2022-10-01');
            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('findDiaryCount', () => {
        const findDiaryCountMockFunc = (returnValue:any) => {
            return Diary.find = jest.fn().mockReturnValue({
                count: jest.fn().mockResolvedValue(returnValue)
            });
        };
        it('userId가 없거나 length가 0이면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
            const result = await service.findDiaryCount(null);
            } catch (error) {
                expect(error.message).toEqual("Invalid userId")
            }
                
        });

        it('다이어리를 검색해서 아무것도 나오지 않는다면 숫자 0을 반환해야 한다.', async () => {
            findDiaryCountMockFunc(null)
            const result = await service.findDiaryCount('userId');
            expect(result.count).toEqual(0);
        });

        it('올바른 userId를 전송하면 다이어리의 수를 반환 한다.', async () => {
            findDiaryCountMockFunc(2)
            const result = await service.findDiaryCount('userId');
            expect(result.count).toEqual(2);
        });
    });

    describe('getDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: "a1",
                subject: 'subject1',
                content: 'content1',
                year: 2022,
                month: 9,
                day: 26,
            },
            {
                _id: "b2",
                subject: 'subject2',
                content: 'content2',
                year: 2022,
                month: 9,
                day: 25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date: '2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date: '2022-09-25'
            }
        ];
        const getDiaryMockFunc = (returnValue:any) => {
            return Diary.find = jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(returnValue)
                })
            });
        };


        it('userId가 없으면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
               const result = await service.getDiary(userId);
           } catch (error) {
               expect(error.message).toEqual("Invalid userId")
           } 
        });

        it('검색 결과가 없을 경우 빈 배열을 반환 한다.', async () => {
            getDiaryMockFunc([])
            
            const result = await service.getDiary(userId);
            expect(result.list).toEqual([]);
        });

        it('검색에 실패하면 Get diary fail을 반환 한다.', async () => {
            getDiaryMockFunc(null)
            try {
                const result = await service.getDiary(userId);
            } catch (error) {
                expect(error.message).toEqual('Get diary fail');
            }
        });


        it('올바른 userId를 전송하면 diary form을 반환 한다.', async () => {
            getDiaryMockFunc(diaryContentArr)
            const result = await service.getDiary(userId);
            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('getLastIdDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                _id: "a1",
                subject: 'subject1',
                content: 'content1',
                year: 2022,
                month: 9,
                day: 26,
            },
            {
                _id: "b2",
                subject: 'subject2',
                content: 'content2',
                year: 2022,
                month: 9,
                day: 25,
            }
        ];
        const validDiaryResult = [
            {
                id: 'a1',
                subject: 'subject1',
                content: 'content1',
                date: '2022-09-26'
            },
            {
                id: 'b2',
                subject: 'subject2',
                content: 'content2',
                date: '2022-09-25'
            }
        ];
        const getLastIdDiaryMockFunc = (returnValue:any) => {
            return Diary.find = jest.fn().mockReturnValue({
                and: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(returnValue)
                    })
                })
            });
        };

        it('userId가 없으면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.getLastIdDiary(null, 'test');
            } catch (error) {
                expect(error.message).toEqual("Invalid userId")
            }
        });

        
        it('검색 결과가 없을 경우 빈 배열을 반환 한다.', async () => {
            getLastIdDiaryMockFunc([])
            const result = await service.getLastIdDiary(userId, 'lastId');
            expect(result.list).toEqual([]);
        });

        it('검색에 실패하면 Get diary fail을 반환 한다.', async () => {
            getLastIdDiaryMockFunc(null)
            try {
                const result = await service.getLastIdDiary(userId, 'lastId');
            } catch (error) {
                expect(error.message).toEqual('Get diary fail');
            }
        });


        it('올바른 userId와 lastDiaryId를 전송하면 diary form을 반환 한다.', async () => {
            getLastIdDiaryMockFunc(diaryContentArr);
            const result = await service.getLastIdDiary(userId, 'lastId');
            expect(result.list).toEqual(validDiaryResult);
        });
    });

    describe('deleteAllDiary', () => {
        const userId = 'testUserId';
        it('userId가 없으면 Invalid userId 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.deleteAllDiary(null);
            } catch (error) {
                expect(error.message).toEqual("Invalid userId")
            }
        });

        it('올바른 userId를 전송하면 All diary deleted를 반환해야 한다.', async () => { //이거 수정가능성 높음
            Diary.deleteMany = jest.fn()
            const result = await service.deleteAllDiary(userId);
            expect(result.message).toEqual('All diary deleted!');
        });
    });

})