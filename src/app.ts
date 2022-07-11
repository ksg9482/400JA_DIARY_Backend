import express from 'express';
import config from './config';
const startServer = () => {
    const app = express();

    app.listen(config.port, () => {

    })
};

startServer();

//helmet추가, nginx 준비