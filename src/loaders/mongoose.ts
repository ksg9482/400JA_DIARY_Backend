import { connect } from 'mongoose';
import { Db } from 'mongodb';
import config from '@/config';

export default async (): Promise<Db> => {
  const batabaseUsername = config.databaseUsername;
  const databasePassword = config.databasePassword;

  const connectionString = `mongodb://${batabaseUsername}:${databasePassword}@${config.databaseURL}`;
  
  const connection = await connect(connectionString);
  return connection.connection.db;
};
