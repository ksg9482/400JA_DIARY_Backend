import { connect } from 'mongoose';
import { Db } from 'mongodb';
import config from '@/config';

export default async (): Promise<Db> => {
  const batabaseUsername = config.databaseUsername;
  const databasePassword = config.databasePassword;

  const connectionString = `mongodb://${batabaseUsername}:${databasePassword}@${config.databaseURL}`;
  
  const connection = await connect(process.env.NODE_ENV === 'production' ? config.databaseURL_Prod : connectionString);
  return connection.connection.db;
};
