import { ISetsellmarket } from "../../types/market/market.ctr";
import { SetsellMarket } from "../../models/index";
import { COIN_TYPE } from "../constants/index";
import db from "../../database/db";
import moment from 'moment-timezone'

class Setmarket {
  async setsell(req: any): Promise<any> {
    const reqInit: ISetsellmarket = new SetsellMarket(
      req.body,
      req.headers.token
    );

    console.log("reqInit ===", reqInit);

    if (!reqInit.token) {
      return {
        data: "require token",
        code: 400,
      };
    }

    if(!reqInit.user_id){
        return {
            data: "User Not Found",
            code: 400
        }
    }

    const regexTest = COIN_TYPE.test(reqInit.type_of_coin);
    if (regexTest === false) {
      return {
        data: "Parameter type_of_coin is invalid",
        code: 401,
      };
    }

    if(reqInit.coin_amount !== Number(reqInit.coin_amount) || reqInit.coin_amount === 0) {
        return {
            data: 'Parameter coin_amount is invalid',
            code: 401
        }
    }


    const strError = [];

    if (!reqInit.type_of_coin) strError.push(`type_of_coin`);
    if (!reqInit.coin_amount) strError.push(`coin_amount`);

    if (strError.length > 0) {
      return {
        data: `require Parameter ${strError.join(",")}`,
        code: 401,
      };
    }

    const {rows: [queryUser]}: any = await db.raw(`
    SELECT * FROM users WHERE user_id = ${reqInit.user_id} limit 1`)

    if(!queryUser) {
        return {
            data: 'User Not Found',
            code: 400
        }
    }

    // query for user's wallet data and user's coin data
    const {rows: [queryDataCoin]}: any = await db.raw(`
    SELECT 
        u.user_id,
        u.user_name,
        u.user_email,
        w.wallet_id ,
        w.wallet_number,
        w.money_in_wallet,
        cw.crypto_id,
        cw.crypto_type,
        cw.crypto_amount
    FROM users as u
    INNER JOIN wallet as w on w.wallet_user_id = u.user_id
    INNER JOIN crypto_wallet as cw on cw.crypto_wallet_id = w.wallet_id
    WHERE u.user_id = ${queryUser.user_id} and cw.crypto_type = '${reqInit.type_of_coin}'
    limit 1`)

    if(!queryDataCoin){
        return {
            data: 'Data Not Found',
            code: 400
        }
    }

    // query for duplicated of coin sell in the market
    const {rows: [queryMarket]}:any = await db.raw(`
    SELECT
        trader,
        type_of_coin
    FROM market_place
    WHERE trader = ${queryUser.user_id} AND type_of_coin = '${reqInit.type_of_coin}'
    limit 1 
    `)

    if(queryMarket) {
        return {
            data: 'This coin has already in market place',
            code: 400
        }
    }

    // assume coin price 14/04/2025
    let btc_coin_price = 2793282.25
    let etc_coin_price = 54281.63
    let xrp_coin_price = 71.09
    let doge_coin_price = 5.54

    // assume us dolar exchange 14/04/2025
    let us_exchange = 33.50

    const currentTime = moment().format()
    const {rows: [insertData]}:any = await db.raw(`
    INSERT INTO market_place(
        type_of_coin,
        type_of_trading,
        trader,
        price_th,
        price_us,
        created_at,
        updated_at,
        coin_amount
    )VALUES(
        '${reqInit.type_of_coin}',
        'SELL',
        ${queryUser.user_id},
        ${reqInit.type_of_coin === 'BTC' ? (btc_coin_price * reqInit.coin_amount).toFixed(2): 
        reqInit.type_of_coin === 'ETC' ? (etc_coin_price * reqInit.coin_amount).toFixed(2):
        reqInit.type_of_coin === 'XRP' ? (xrp_coin_price * reqInit.coin_amount).toFixed(2):
        reqInit.type_of_coin === 'DOGE' ? (doge_coin_price * reqInit.coin_amount).toFixed(2): ''},
        ${reqInit.type_of_coin === 'BTC' ? ((btc_coin_price * reqInit.coin_amount)/us_exchange).toFixed(2): 
        reqInit.type_of_coin === 'ETC' ? ((etc_coin_price * reqInit.coin_amount)/us_exchange).toFixed(2):
        reqInit.type_of_coin === 'XRP' ? ((xrp_coin_price * reqInit.coin_amount)/us_exchange).toFixed(2):
        reqInit.type_of_coin === 'DOGE' ? ((doge_coin_price * reqInit.coin_amount)/us_exchange).toFixed(2): ''},
        '${currentTime}',
        '${currentTime}',
        ${reqInit.coin_amount}
    )RETURNING marketplace_id
    `)

    console.log('insertData ===', insertData);
    
    await db.raw(`
    UPDATE crypto_wallet SET
        crypto_amount = ${queryDataCoin.crypto_amount - reqInit.coin_amount}
    WHERE crypto_id = ${queryDataCoin.crypto_id}
    `)

    return {
      data: {
        market_id: insertData.marketplace_id,
        message: 'Create successful'
      },
      code: 200,
    };
  }
}

const SetmarketController = new Setmarket();
export default SetmarketController;
