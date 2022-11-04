import expressLoader from './express';
import mongooseLoader from './mongoose';
import Logger from './logger';
export default async ({expressApp}) => {
    await mongooseLoader();
    Logger.info('DB loaded and connected');
    
    expressLoader({app:expressApp});
    Logger.info('express loaded');
}