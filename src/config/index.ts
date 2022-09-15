import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if(envFound.error) {
    throw new Error("Couldn't find .env file");
};

export default {
    //express port
    port: Number(process.env.PORT),

    //database
    databaseURL: process.env.MONGODB_URI, //host로 이름바꾸는게 좋을지도?
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

    //email 메일건?
    emails: {
        apiKey:process.env.MAILGUN_API_KEY,
        apiUserName:process.env.MAILGUN_DOMAIN_NAME,
        domain:process.env.MAILGUN_FROMEMAIL
    },

    testDatabaseURL: process.env.TEST_MONGODB_URI, //host로 이름바꾸는게 좋을지도?
    testDatabaseUsername:process.env.TEST_MONGODB_USERNAME,
    testDatabasePassword:process.env.TEST_MONGODB_PASSWORD,

    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,

    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI:process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET
}