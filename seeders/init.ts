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


  if (!dbConfig) {
    console.error(`Database configuration for environment "${environment}" is missing.`);
    return;
  }

  const client = new Client({
    user: dbConfig.user || 'localhost',
    host: dbConfig.host || 'myuser',
    database: dbConfig.database || 'postgres',
    password: dbConfig.password || '123456',
    port: dbConfig.port || 5432,
  });

  

  try {
    await client.connect()

    // create users table
    await client.query(`
    create table IF NOT EXISTS users (
        user_id serial primary key,
        user_name varchar(50) not null,
        user_email varchar(50) not null,
        user_password varchar(200) not null,
        created_at timestamp not null,
        update_at timestamp not null
        ) 
    `)
    console.log('Table "users" created');

    // create wallet table
    await client.query(`
    create table IF NOT EXISTS wallet (
        wallet_id serial primary key,
        wallet_number varchar(50) not null,
        money_in_wallet int not null,
        wallet_user_id int REFERENCES users(user_id) not null,
        created_at timestamp not null,
        update_at timestamp not null
        ) 
    `)

    console.log('Table "wallet" created');


    // create crypto_wallet table
    await client.query(`
    create table IF NOT EXISTS crypto_wallet (
        crypto_id serial primary key,
        crypto_type varchar(50) not null,
        crypto_amount int not null,
        crypto_wallet_id int REFERENCES wallet(wallet_id) not null,
        created_at timestamp not null,
        update_at timestamp not null
        ) 
    `)
    console.log('Table "crypto_wallet" created');


    // create market_place table
    await client.query(`
    create table IF NOT EXISTS market_place (
        marketplace_id serial primary key,
        type_of_coin varchar(50) not null,
        type_of_trading varchar(50) not null,
        trader int REFERENCES users(user_id) not null,
        price_TH int not null,
        price_US int not null,
        coin_amount int not null,
        payment varchar(50) not null,
        created_at timestamp not null,
        updated_at timestamp not null
        ) 
    `)
    console.log('Table "market_place" created');


    // create trading_crypto table
    await client.query(`
    create table IF NOT EXISTS trading_crypto (
        transaction_id serial primary key,
        type_of_trading varchar(50) not null,
        trader_user_id int not null,
        recipient_id int not null,
        trading_amount int not null,
        description varchar(200),
        created_at timestamp not null,
        update_at timestamp not null,
        type_of_coin varchar(50) not null
        ) 
    `)

    console.log('Table "trading_crypto" created');




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

    console.log('wallet seeded');
    

  }catch (error){
    console.error('Error during seeding:', error);
  }finally {
    await client.end()
  }
}

seedDatabase()