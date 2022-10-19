import config from "@/config";
import { Mail } from "@/interfaces/Mail";
import mailgun from "mailgun-js";
import { HydratedDocument } from "mongoose";
import { Logger } from "winston";
import {v4 as uuidv4} from "uuid";
import { tempPasswordSubject, verifySubject } from "./mailText";

export default class MailService {

    mailModel: Models.MailModel;
    logger: Logger;
    

    
    constructor(mailModel: Models.MailModel, logger: Logger) {
        this.mailModel = mailModel;
        this.logger = logger;
    };
    
    public async sendEmail(email:string, subject:string, content:string) {
        const mg = mailgun({ apiKey: config.emails.apiKey, domain: "sandboxd2ade7baf7c340de8d9ba26b7575b955.mailgun.org" });
        const mailData = {
            from: '<400JA-DIARY@400JA-DIARY.com>',
            to: [email], 
            subject: subject,
            text: content
        };
        
        const result = await mg.messages().send(mailData);
        if(!result) {
            throw new Error('Mailgun send email error');
        }
        return true
    }
    public async sendUserValidEmail(email:string, randomCode:string) { //findPassword에서 인증메일 보내기
        if (!email) {
            throw new Error("Bad email parametor");
        };
        const FRONTEND_HOST = config.frontendHost;
        const FRONTEND_PORT = config.frontendport;
        const mailSubject = verifySubject
        const mailContent = '회원인증용 이메일입니다. 링크를 클릭해주세요 \n'
        +`${FRONTEND_HOST}:${FRONTEND_PORT}/verify/code?code=${randomCode}`
       
        const result = await this.sendEmail(email, mailSubject, mailContent);
        
        return {message:'Send verify Email'};

    };

    public async saveValidCode(email:string, code:string) { //findPassword에서 인증메일 보내기
        const saveCode = async (email:string, code:string) => { //object or null
            const mailRecord: HydratedDocument<Mail> = new this.mailModel(
                {
                    email: email,
                    verifyCode: code
                }
            );
            const mailsave = await mailRecord.save();
            if (mailsave.errors) {
                throw new Error('Save verify code Fail');
            };
            return mailsave;
        };
        const saveEmailAndCode = await saveCode(email, code);
        return {message:'saved'}
    };

    public async emailValidCheck(code:string) {
        const findEmail = async (code:string) => { 
            const emailRecord = await this.mailModel.findOneAndRemove({verifyCode: code});
            
            if(!emailRecord) {
               throw new Error('Email not found')
            };

            return {...emailRecord['_doc']};
        }
        
        const matchedEmail = await findEmail(code);
        return {email: matchedEmail.email};
    };

    public async sendTempPassword(email:string, tempPassword:string) {
        if (!email) {
            throw new Error("Bad email parametor");
        };
        if (!tempPassword) {
            throw new Error("Bad tempPassword parametor");
        };

        const mailSubject = tempPasswordSubject;
        const mailContent = `임시비밀번호는 ${tempPassword} 입니다.`;
        const result = await this.sendEmail(email, mailSubject, mailContent);
        
        return {message:'Send temp password Email'}
    };

    public createVerifyCode() {
        const randomCode = uuidv4();
        return randomCode
    };
};