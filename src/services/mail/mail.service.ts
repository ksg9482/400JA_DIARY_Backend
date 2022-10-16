import config from "../../config";
import { Mail } from "@/interfaces/Mail";
import mailgun from "mailgun-js";
import { HydratedDocument } from "mongoose";
import { Logger } from "winston";
import {v4 as uuidv4} from "uuid";
import { tempPasswordSubject, verifySubject } from "./mailText";

export default class MailService {

    mailModel: Models.MailModel;
    logger: Logger;
    

    //global과 namespace 사용. model로 선언해서 monguuse메서드 사용
    constructor(mailModel: Models.MailModel, logger: Logger) {
        this.mailModel = mailModel;
        this.logger = logger;
    };
    // constructor(
    //     private emailClient,
    //     private emailDomain
    // ) {
    //     this.emailClient = emailClient;
    //     this.emailDomain = emailDomain;
    // };

    //code 생성해서 메일로 보내기
    //https://400ja/passwordFind?code=21564ad5as4d65z4형식이 내용. html 보내기?
    //접속하면 코드를 그대로 백엔드로 보냄
    //백엔드에서 수신. 맞으면 모달창으로 해당 이메일로 임시비번 보냈다 안내
    //email 모델 만들어야하나? email과 valid code. 5분 지나면 사라지게.
    //아니면 코드 정합성 검사는 어떻게?
    public async sendEmail(email:string, subject:string, content:string) {
        // const mg = mailgun({ apiKey: config.emails.apiKey, domain: config.emails.domain });
        const mg = mailgun({ apiKey: config.emails.apiKey, domain: "sandboxd2ade7baf7c340de8d9ba26b7575b955.mailgun.org" });
        const mailData = {
            from: '<400JA-DIARY@400JA-DIARY.com>',
            to: [email], 
            subject: subject,
            text: content
            // template: '400ja-diary',
            // 'h:X-Mailgun-Variables': mailText
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
        const PROTOCOL = 'http';
        const FRONTEND_HOST = 'localhost';
        const FRONTEND_PORT = 3000;
        const mailSubject = verifySubject
        const mailContent = '회원인증용 이메일입니다. 링크를 클릭해주세요 \n'
        +`${PROTOCOL}://${FRONTEND_HOST}:${FRONTEND_PORT}/verify/code?code=${randomCode}`
       //서버로 보내는 게 아니라 프론트엔드 verify페이지로 보냄.
       //거기서 code를 백엔드로 보내고, 백엔드에서 처리
       //클라이언트는 성공메시지 감지 -> 모달창. 이메일 보냈다.
       //확인 누르면 그창 꺼짐
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

    public async emailValidCheck(code:string) { //findPassword에서 인증메일 보내기
        //코드가 들어오면 코드로 검색 -> 해당하는 이메일 나옴
        //이메일 반환 OR 해당하는 이메일 없으면 에러 반환
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

    public async sendTempPassword(email:string, tempPassword:string) { //findPassword에서 인증메일 보내기
        //이메일 임시비번으로 바꿨다 안내
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
    }
    // public async startEmailSequence(sequence, user: Partial<IUser>) {
    //     if (!user.email) {
    //         throw new Error('No email provided');
    //     }

    //     return { delivered: 1, status: 'ok' };
    // }
};

//유저: 비번찾기 요청. 이메일 전송 -> 서버: 이메일 수신. 소셜로그인 확인. 'BASIC'이면 인증코드 이메일 전송. 아니면 소셜로그인은 비번찾기 못한다 안내
//서버: 인증코드 보냈다 안내 -> 유저: 이메일 접속. 인증코드가 포함된 링크 클릭
//유저: 클릭한 링크는 인증코드를 파라미터로 전송 -> 서버: 파라미터에 담긴 코드로 DB검색. 이메일이 나옴. 임시비번 생성. 비밀번호 변경.
//서버: 임시비번 보냈다 안내 -> 유저: 임시비번으로 로그인