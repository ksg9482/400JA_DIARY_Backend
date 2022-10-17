import express from 'express';
import config from '@/config';
import Logger from '@/loaders/logger';
export const startServer = async () => {
    // process.env.NODE_ENV = 
    // ( 
    //     process.env.NODE_ENV 
    //     && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' 
    // ) 
    // ? 'production' 
    // : 'development';

    const app = express();

    await require('./loaders').default({expressApp: app})

  

    app.listen(config.port, () => {
        Logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
        Logger.info(`Server listening on port: ${config.port}`);
    })
    .on('error', err => {
        Logger.error(err);
        process.exit(1);
    });
    
};

startServer(); 


//helmet추가, nginx 준비

//todo loders 추가, express 설정, eslint 설정