import dotenv from 'dotenv';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();

export default {
    //express port
    port: Number(process.env.PORT),

    //prontend-Oauth 리다이렉트
    frontendHost: process.env.FRONTEND_HOST,

    //database
    databaseURL: process.env.MONGODB_URI,
    
    //jwt
    jwtAccess: process.env.JWT_ACCESS,

    jwtRefresh: process.env.JWT_REFRESH,

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