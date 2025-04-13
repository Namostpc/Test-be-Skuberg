import type {Knex} from 'knex'

const config: { [key: string]: Knex.Config } = {
    development: {
      client: 'pg',
      connection: {
        host: process.env.HOST || 'localhost',
        port: Number(process.env.PORT) || 5432,
        user: process.env.USER_NAME || 'myuser',
        password: process.env.PASSWORD || '123456',
        database: process.env.DATABASE_NAME || 'postgres',
      },
      migrations: {
        directory: './db/migrations'
      },
      seeds: {
        directory: './db/seeds'
      }
    }
  };
  
  module.exports = config;