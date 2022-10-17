import express from 'express';
import cors from 'cors';
import config from '@/config';
import routes from '@/api'
import swaggerOptions from '@/../swagger';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
export default ({app}:{app: express.Application}) => {
    //헬스체크 엔드포인트 넣기


    //연결 확인용
    app.get('/status', (req, res) => {
        res.status(200).json({message:'connect'});
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    app.use(helmet())

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec,{explorer:true}));
   
    const whiteList = ['http://localhost:3000'];
    const corsMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];
    app.use(
        cors(
        {
            origin:whiteList,
            credentials:true,
            methods:corsMethods
        }
    ));
    app.use(express.json());

     // Load API routes
    app.use(config.api.prefix, routes());

    //404 에러 핸들러. 
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    //에러 핸들러
    app.use((err, req, res, next) => {
        
        if(!err.status) {
            return res.status(500).json({error:{message: 'Server error'}});
        }
        let errorBody:{message: any, name?:string} = {
                message: err.message
        };
        if(err.name && err.name !== 'Error') {
            errorBody.name = err.name;
        };
        return res.status(err.status).json({error:{...errorBody}});
    });
};