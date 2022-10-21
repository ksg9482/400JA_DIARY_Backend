import MailService from "./mail.service";
import Mail from '@/models/mail'
import logger from '@/loaders/logger';

export function createMailInstance():MailService {
    return new MailService(Mail, logger)
}
