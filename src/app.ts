import express from 'express';
import config from './config';
const startServer = () => {
    const app = express();

    app.listen(config.port, () => {
        console.log(`port: ${config.port}`)
    })
};

startServer();

//helmet추가, nginx 준비

//todo loders 추가, express 설정, eslint 설정