import express from 'express';
import config from './config';
import Logger from './loaders/logger';

export const startServer = async () => {
    const app = express();

    await require('./loaders').default({expressApp: app})

    app.listen(config.port, () => {
        Logger.info(`Server listening on port: ${config.port}`);
    })
    .on('error', err => {
        console.log(err)
        Logger.error(err);
        process.exit(1);
    });
};

startServer();

//helmet추가, nginx 준비

//todo loders 추가, express 설정, eslint 설정