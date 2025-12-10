import dotenv from 'dotenv';
import {
  UserCompletedQuestAction,
  User,
  Token,
  UserTokenBalance,
  QuestAction,
  SocialAuth,
  Quest,
  Reward,
  UserJoinedQuest,
  Transaction,
} from 'src/domain';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

dotenv.config();

const defaultDataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  entities: [
    User,
    SocialAuth,
    Quest,
    QuestAction,
    UserCompletedQuestAction,
    Token,
    UserTokenBalance,
    Reward,
    UserJoinedQuest,
    Transaction,
  ],
  synchronize: true,
  seeds: ['src/infrastructure/database/seeders/*{.ts,.js}'],
};

export const getDefaultDataSourceOptions = () => {
  const url = getEnvVar('DATABASE_URL');

  if (!url) {
    throw Error('Invalid database URL');
  }

  return {
    ...defaultDataSourceOptions,
    url,
  } as DataSourceOptions;
};

const getEnvVar = (variable: string, defaultValue?: string | boolean) =>
  process.env[variable] ?? defaultValue;

const dataSource = new DataSource(getDefaultDataSourceOptions());

export default dataSource;
