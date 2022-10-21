import { connect } from 'mongoose';
import { Db } from 'mongodb';
import config from '@/config';

export default async (): Promise<Db> => {
  

  const connection = await connect(config.databaseURL);
  return connection.connection.db;
};
