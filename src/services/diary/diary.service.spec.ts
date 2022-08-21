import Diary from '../../models/diary'
import logger from "../../loaders/logger";
import HashUtil from "../utils/hashUtils";
import JwtUtil from "../utils/jwtUtils";
import DiaryService from "./diary.service";

describe('DiaryService', () => {
    let service: DiaryService;

    beforeEach(() => {
        service = new DiaryService(Diary, logger)
    })
    describe('createDiaryContent', () => {
        const userId = 'testUserId';
        const diaryContent = {subject:'test subject',content:'test content'};
        
        it('diaryContent를 전송하지 않는다면 No Diary parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, null);
            } catch (error) {
                expect(error).toEqual(new Error('No Diary parametor'));
            };
        });

        it('diaryContent의 length가 0이면 No Diary parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.createDiaryContent(userId, {...diaryContent, subject:'',content:''});
            } catch (error) {
                expect(error).toEqual(new Error('No Diary parametor'));
            };
        });


        it('올바른 userId와 diaryContent를 전송하면 saved를 반환해야 한다.', async () => {
            jest.spyOn(Diary.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve({ message: 'saved' }))
            const result = await service.createDiaryContent(userId, diaryContent);

            expect(result).toEqual({ message: 'saved' });
        });
    });

    describe('findAllDiary', () => {
        const userId = 'testUserId';
        const diaryContentArr = [
            {
                id: 'a1',
                subject:'subject1',
                content:'content1'
            },
            {
                id: 'b2',
                subject:'subject2',
                content:'content2'
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
                id: 'a1',
                subject:'subject1',
                content:'content1'
            },
            {
                id: 'b2',
                subject:'subject2',
                content:'content2'
            }
        ];
        const testKeyword = 'keyword'
        it('다이어리를 검색해서 아무것도 나오지 않는다면 Diary is Empty를 반환해야 한다.', async () => { //이거 수정가능성 높음
            try {
                Diary.find = jest.fn().mockResolvedValue(undefined)
                const result = await service.findKeyword(userId, testKeyword);
            } catch (error) {
                expect(error).toEqual(new Error('Diary is Empty'));
            };
        });

        it('올바른 userId와 키워드를 전송하면 올바른 결과를 반환해야 한다.', async () => { //이거 수정가능성 높음
            Diary.find = jest.fn().mockResolvedValue(diaryContentArr)
            const result = await service.findKeyword(userId, testKeyword);

            expect(result).toEqual(diaryContentArr);
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