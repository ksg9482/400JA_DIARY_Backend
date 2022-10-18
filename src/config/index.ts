import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if(envFound.error) {
    throw new Error("Couldn't find .env file");
};

export default {
    //express port
    port: Number(process.env.PORT) || 8080,
    domain: process.env.DOMAIN || 'localhost',

    //prontend-Oauth 리다이렉트
    prontendProtocol: process.env.PRONTEND_PROTOCOL,
    prontendHost: process.env.PRONTEND_HOST,
    prontendport: process.env.PRONTEND_PORT,

    //database
    databaseURL: process.env.MONGODB_URI,
    databaseUsername:process.env.MONGODB_USERNAME,
    databasePassword:process.env.MONGODB_PASSWORD,
    //jwt
    jwtSecret: process.env.JWT_SECRET,

    //winston logger
    logs: {
        level: process.env.LOG_LEVEL || 'silly'
    },

    //API config
    api: {
        prefix: '/api'
    },

    //email
    emails: {
        apiKey:process.env.MAILGUN_API_KEY,
        apUserName:process.env.MAILGUN_FROMEMAIL,
        domain:process.env.MAILGUN_DOMAIN_NAME
    },

    testDatabaseURL: process.env.TEST_MONGODB_URI,
    testDatabaseUsername:process.env.TEST_MONGODB_USERNAME,
    testDatabasePassword:process.env.TEST_MONGODB_PASSWORD,

    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI
}