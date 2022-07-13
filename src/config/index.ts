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
    databaseURL: process.env.MONGODB_URI,

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
        apiKey:'',
        apiUserName:'',
        domain:''
    }

}