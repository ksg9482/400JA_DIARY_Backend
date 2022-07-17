import { connect } from 'mongoose';
import { Db } from 'mongodb';
import config from '@/config';

export default async (): Promise<Db> => {
  const batabaseUsername = config.databaseUsername;
  const databasePassword = config.databasePassword;
  //const connectionString = `mongodb://${batabaseUsername}:${databasePassword}@${config.databaseURL}/apilocal?authSource=admin&authMechanism=SCRAM-SHA-1`;
  const connectionString = `mongodb://${batabaseUsername}:${databasePassword}@${config.databaseURL}`;
  //const connectionString = `mongodb://127.0.0.1:27017/my-app`;
  const connection = await connect(connectionString);
  return connection.connection.db;
};
