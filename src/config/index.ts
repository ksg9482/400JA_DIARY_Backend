import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if(envFound.error) {
    throw new Error("Couldn't find .env file");
};

export default {
    //express port
    port: Number(process.env.PORT),

    //prontend-Oauth 리다이렉트
    frontendHost: process.env.FRONTEND_HOST,
    frontendport: process.env.FRONTEND_PORT,

    //database
    databaseURL: process.env.MONGODB_URI,
    databaseURL_Prod: process.env.MONGODB_URI_PRODUCTION,
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

    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI
}