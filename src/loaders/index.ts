import expressLoader from './express';
import mongooseLoader from './mongoose';
import Logger from './logger';
export default async ({expressApp}) => {
    //database connection
    //models에 만든 모델 연결
    //의존성 주입
    await mongooseLoader();
    Logger.info('DB loaded and connected');
    
    expressLoader({app:expressApp}); //await?
    Logger.info('express loaded');
}