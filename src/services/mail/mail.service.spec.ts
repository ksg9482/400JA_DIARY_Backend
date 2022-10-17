import Mail from '@/models/mail'
import logger from "@/loaders/logger";
import MailService from "./mail.service";
import mailgun from "mailgun-js";
import uuid from "uuid";
import { tempPasswordSubject, verifySubject } from './mailText';
jest.mock('uuid', () => ({ v4: () => '123456789' }));

jest.mock('mailgun-js', () => {
    const mMailgun = {
        messages: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };
    return jest.fn(() => mMailgun);
});

const testEmail = 'test@Email.com';
const testSubject = 'testSubject';
const testContent = 'testContent';
const testCode = 'testCode';
const testTempPassword = 'testTempPassword';
const testMailData = {
    from: '<400JA-DIARY@400JA-DIARY.com>',
    to: [testEmail],
    subject: testSubject,
    text: testContent
};

const mg = mailgun({ apiKey: 'apikey', domain: 'domain' });

describe('UserService', () => {
    let service: MailService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new MailService(Mail, logger)
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendEmail', () => {
        it('메일 전송에 실패하면 Mailgun send email error 에러를 반환한다', async () => {
            try {
                const mg = mailgun({} as any);
                (mg.messages().send as jest.MockedFunction<any>).mockResolvedValueOnce(false);

                const result = await service.sendEmail(testEmail, testSubject, testContent);
            } catch (error) {
                expect(error).toEqual(new Error('Mailgun send email error'))
            };
        });

        it('정상적으로 메일을 보내면 true를 반환한다', async () => {
            const mg = mailgun({} as any);
            (mg.messages().send as jest.MockedFunction<any>).mockResolvedValueOnce({
                id: '222',
                message: 'Queued. Thank you.',
            });

            const result = await service.sendEmail(testEmail, testSubject, testContent);

            expect(mg.messages).toBeCalled();
            expect(mg.messages().send).toBeCalledWith(testMailData);
            expect(result).toEqual(true)
        });

    })

    describe('sendUserValidEmail', () => {
        it('email이 없다면 Bad email parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.sendUserValidEmail('', 'randomCode');
            } catch (error) {
                expect(error).toEqual(new Error('Bad email parametor'));
            };

        });

        it('제공된 이메일로 인증링크를 보내야 한다.', async () => {
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => true)
            

            mg.messages = jest.fn().mockReturnValue({
                send: jest.fn().mockResolvedValue('send!')
            })
            
            const randomCode = uuid.v4()
            const result = await service.sendUserValidEmail(testEmail, randomCode);
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                testEmail,
                verifySubject,
                '회원인증용 이메일입니다. 링크를 클릭해주세요 \n' + `http://localhost:3000/verify/code?code=${randomCode}`
            );
            expect(result).toEqual({ message: 'Send verify Email' });
        });
    });
    describe('saveValidCode', () => {
        it('verify code 저장에 실패하면 Save verify code Fail 에러를 반환해야 한다.', async () => {
            try {
                jest.spyOn(Mail.prototype, 'save')
                    .mockImplementationOnce(() => Promise.resolve({ errors: 'error!' }));

                const result = await service.saveValidCode(testEmail, testCode);
            } catch (error) {
                expect(Mail.prototype.save).toHaveBeenCalledTimes(1);
                expect(error).toEqual(new Error('Save verify code Fail'));
            };
        });

        it('전송한 유저인증 코드와 요청한 유저의 이메일이 저장되어야 한다.', async () => {
            jest.spyOn(Mail.prototype, 'save')
                .mockImplementationOnce(() => Promise.resolve('saved'));

            const result = await service.saveValidCode(testEmail, testCode);

            expect(Mail.prototype.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ message: 'saved' });
        });
    });
    describe('emailValidCheck', () => {
        it('code로 검색해서 해당하는 이메일이 없으면 Email not found 에러를 반환한다.', async () => {
            try {
                Mail.findOneAndRemove = jest.fn().mockResolvedValue(null)

                const result = await service.emailValidCheck(testCode);
            } catch (error) {
                expect(Mail.findOneAndRemove).toHaveBeenCalledTimes(1);
                expect(Mail.findOneAndRemove).toHaveBeenCalledWith({ verifyCode: testCode });
                expect(error).toEqual(new Error('Email not found'));
            }


        });
        it('인증링크에 포함된 parametor인 code가 제공되면 DB에 저장된 코드인지 확인하고 맞으면 이메일을 반환한다.', async () => {
            Mail.findOneAndRemove = jest.fn().mockResolvedValue({ _doc: { email: testEmail, verifyCode: testCode } })

            const result = await service.emailValidCheck(testCode);

            expect(Mail.findOneAndRemove).toHaveBeenCalledTimes(1);
            expect(Mail.findOneAndRemove).toHaveBeenCalledWith({ verifyCode: testCode });
            expect(result).toEqual({ email: testEmail });
        });
    });
    describe('sendTempPassword', () => {
        it('email이 없다면 Bad email parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.sendTempPassword('', testTempPassword);
            } catch (error) {
                expect(error).toEqual(new Error('Bad email parametor'));
            };

        });

        it('tempPassword가 없다면 Bad tempPassword parametor 에러를 반환해야 한다.', async () => {
            try {
                const result = await service.sendTempPassword(testEmail, '');
            } catch (error) {
                expect(error).toEqual(new Error('Bad tempPassword parametor'));
            };

        });

        it('제공된 이메일로 임시 비밀번호 안내를 보내야 한다.', async () => {
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => true)

            mg.messages = jest.fn().mockReturnValue({
                send: jest.fn().mockResolvedValue('send!')
            })
            const result = await service.sendTempPassword(testEmail, testTempPassword);
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                testEmail,
                tempPasswordSubject,
                `임시비밀번호는 ${testTempPassword} 입니다.`
            );
            expect(result).toEqual({ message: 'Send temp password Email' });
        });
    });

    describe('createVerifyCode', () => {
        it('문자열을 반환해야 한다.', async () => {
            const randomCode = uuid.v4()
            const result = service.createVerifyCode();

            expect(result).toEqual(randomCode);
        });
    });
});