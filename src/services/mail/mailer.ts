import config from "@/config";
import { IUser } from "@/interfaces/IUser";
import mailgun from "mailgun-js";
import { mailSubject, mailText } from "./mailText";

export default class MailerService {

    constructor(
        private emailClient,
        private emailDomain
    ) {
        this.emailClient = emailClient;
        this.emailDomain = emailDomain;
    };

    public async SendWellcomeEmail(email) {
        const mg = mailgun({apiKey: config.emails.apiKey, domain: config.emails.domain});
        const mailData = {
            from: '<wellcome@400JA-DIARY.com>',
            to: [email], //`${process.env.MAILGUN_FROMEMAIL}` 메일건 테스트용
            subject: mailSubject,
            template:'400ja-diary',
            'h:X-Mailgun-Variables': mailText
        };
        try {
            mg.messages().send(mailData, function(error, body) {
                if(error) {
                    throw new Error(error.message)
                }
            })
            //this.emailClient.messages.create(this.emailDomain, mailData);
            return { delivered: 1, status: 'ok' };
        } catch (error) {
            return { delivered: 0, status: 'error' };
        };
    };

    public async startEmailSequence(sequence, user:Partial<IUser>) {
        if(!user.email) {
            throw new Error('No email provided');
        }

        return { delivered: 1, status: 'ok' };
    }
};

