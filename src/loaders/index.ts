import expressLoader from './express';
import Logger from './logger';
export default async ({expressApp}) => {
    //database connection
        //models에 만든 모델 연결
    expressLoader({app:expressApp}); //await?
    Logger.info('express loaded');
}