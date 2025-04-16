import { Client } from 'pg';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone'

const config = require('../db/knex.config')
const environment: string = process.env.NODE_ENV || 'development';
const dbConfig = config[environment]?.connection;

const currenTime = moment().format()


async function seedDatabase() {
const passOne = await bcrypt.hash('password1', 10)
const passTwo = await bcrypt.hash('password2', 10)
console.log('passOne ===', passOne);


  if (!dbConfig) {
    console.error(`Database configuration for environment "${environment}" is missing.`);
    return;
  }

  const client = new Client({
    user: dbConfig.user,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port || 5432,
  });

  

  try {
    await client.connect()


    // Seed User
    const {rows: insertUser}:any = await client.query(`
    INSERT INTO users(
        user_name,
        user_email,
        user_password,
        created_at,
        update_at
    )VALUES(
        'testuser1',
        'testuser1@fakemail.com',
        '${passOne}',
        '${currenTime}',
        '${currenTime}'
    ),(
        'testuser2',
        'testuser2@fakemail.com',
        '${passTwo}',
        '${currenTime}',
        '${currenTime}'
    )RETURNING user_id`)
    console.log('insertUser ==', insertUser);
    
    console.log('Users seeded');
    

    // seed user wallet
    await client.query(`
    INSERT INTO wallet(
        wallet_number,
        money_in_wallet,
        wallet_user_id,
        created_at,
        update_at
    )VALUES(
        '123456789',
        10000000,
        ${insertUser[0].user_id},
        '${currenTime}',
        '${currenTime}'
    ),(
        '987654321',
        100000000,
        ${insertUser[1].user_id},
        '${currenTime}',
        '${currenTime}'
    )`)

    console.log('Users seeded');
    

  }catch (error){
    console.error('Error during seeding:', error);
  }finally {
    await client.end()
  }
}

seedDatabase()