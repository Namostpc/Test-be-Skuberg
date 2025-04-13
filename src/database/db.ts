import knex, {Knex} from 'knex'

const config = require('../../db/knex.config')

const environment: string = process.env.NODE_ENV || 'development';
const db: Knex = knex(config[environment]);

export default db;