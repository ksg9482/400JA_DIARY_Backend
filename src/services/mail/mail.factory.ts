import MailService from "./mail.service";
import Mail from '../../models/mail'
import logger from '../../loaders/logger';
import config from "../../config";

export function createMailInstance():MailService {
    //유저 인스턴스를 생성하는 팩토리 패턴
    return new MailService(Mail, logger)
}
