import config from "@/config";
import { IUser } from "@/interfaces/IUser";
import mailgun from "mailgun-js";
import { mailSubject, mailText } from "./mailText";

export default class MailerService {

    // constructor(
    //     private emailClient,
    //     private emailDomain
    // ) {
    //     this.emailClient = emailClient;
    //     this.emailDomain = emailDomain;
    // };

    //code 생성해서 메일로 보내기
    //https://400ja/passwordFind?code=21564ad5as4d65z4형식이 내용
    //접속하면 코드를 그대로 백엔드로 보냄
    //백엔드에서 수신. 맞으면 모달창으로 해당 이메일로 임시비번 보냈다 안내
    public async SendWellcomeEmail(email) {
        const mg = mailgun({ apiKey: config.emails.apiKey, domain: config.emails.domain });
        const mailData = {
            from: '<wellcome@400JA-DIARY.com>',
            to: [email], //`${process.env.MAILGUN_FROMEMAIL}` 메일건 테스트용
            subject: mailSubject,
            text: 'Testing some Mailgun awesomness!'
            // template: '400ja-diary',
            // 'h:X-Mailgun-Variables': mailText
        };

        const result = await mg.messages().send(mailData);
        if (!result) {
            throw new Error('mailgun error')
        }
        
        //this.emailClient.messages.create(this.emailDomain, mailData);
        return {...result};

    };

    public async startEmailSequence(sequence, user: Partial<IUser>) {
        if (!user.email) {
            throw new Error('No email provided');
        }

        return { delivered: 1, status: 'ok' };
    }
};

