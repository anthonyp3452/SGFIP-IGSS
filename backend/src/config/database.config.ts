import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
};

export const buildDatabaseConfig = (
  db: DatabaseConfig,
  nodeEnv: string,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.name,
  autoLoadEntities: true,
  synchronize: nodeEnv === 'development',
});
