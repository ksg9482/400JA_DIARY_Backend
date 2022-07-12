import express from 'express';
import cors from 'cors'

export default ({app}:{app: express.Application}) => {
    //연결 확인용
    app.get('/status', (req, res) => {
        res.status(200).end();
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    app.use(cors());
    app.use(express.json());

    //404 에러 핸들러. 
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    //에러 핸들러
    app.use((err, req, res, next) => {
        if(err.name === 'UnauthorizedError') {
            return res
            .status(err.status)
            .send({message: err.message})
            .end();
        };
        return next(err);
    });
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message
            }
        });
    });
};