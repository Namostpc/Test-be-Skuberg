import { ITrading } from "../../types/trading/trading.ctr";
import { Trading } from "../../models/index";
import db from "../../database/db";
import moment from "moment-timezone";
import { CURRENCIES } from "../constants/index";

class TradingCtr {
  async trading(req: any): Promise<any> {
    const reqInit: ITrading = new Trading(req.headers.token, req.body);

    if (!reqInit.token) {
      return {
        data: "require token",
        code: 400,
      };
    }

    if (!reqInit.user_id) {
      return {
        data: "User Not Found",
        code: 400,
      };
    }

    const errorMessage = [];
    if (!reqInit.market_id) errorMessage.push("merket_id");
    if (!reqInit.coin_amount) errorMessage.push("coin_amount");
    if (!reqInit.currency) errorMessage.push("currency");

    const regExtest = CURRENCIES.test(reqInit.currency);

    if (errorMessage.length !== 0) {
      return {
        data: `require Parameters ${errorMessage.join(",")}`,
        code: 401,
      };
    }

    if (regExtest === false) {
      return {
        data: "currency is invalid",
        code: 400,
      };
    }

    const {
      rows: [queryUser],
    }: any = await db.raw(`
        SELECT * FROM users WHERE user_id = ${reqInit.user_id} limit 1`);

    if (!queryUser) {
      return {
        data: "User Not Found",
        code: 400,
      };
    }

    // assume coin price 14/04/2025
    let btc_coin_price = 2793282.25;
    let etc_coin_price = 54281.63;
    let xrp_coin_price = 71.09;
    let doge_coin_price = 5.54;

    // check user_wallet
    const {
      rows: [queryUserWallet],
    }: any = await db.raw(`
        SELECT * FROM wallet WHERE wallet_user_id = ${queryUser.user_id} limit 1`);

    if (!queryUserWallet) {
      return {
        data: `Haven't Create wallet yet`,
        code: 400,
      };
    }

    // assume us dolar exchange 14/04/2025
    let us_exchange = 33.5;
    let exchangedMoney = 0;
    if (reqInit.currency === "USD") {
      exchangedMoney = queryUserWallet.money_in_wallet / us_exchange;
    }

    //Check marketplace from market_id

    const {
      rows: [queryMarket],
    }: any = await db.raw(`
        SELECT * FROM market_place WHERE marketplace_id = ${reqInit.market_id} limit 1`);

    if (!queryMarket) {
      return {
        data: "Data Not Found",
        code: 400,
      };
    }

    if (queryMarket.trader === reqInit.user_id) {
      return {
        data: "Can not trade with this trader",
        code: 400,
      };
    }

    //query for get info of Recipient

    const {
      rows: [queryRecipientData],
    }: any = await db.raw(`
    SELECT 
        u.user_id,
        u.user_name,
        w.wallet_id,
        w.money_in_wallet,
        cw.crypto_type,
        cw.crypto_id,
        cw.crypto_amount
    FROM users as u
    INNER JOIN wallet as w on w.wallet_user_id = u.user_id
    INNER JOIN crypto_wallet as cw on cw.crypto_wallet_id = w.wallet_id
    WHERE u.user_id = ${queryMarket.trader} AND cw.crypto_type = '${queryMarket.type_of_coin}'
    LIMIT 1
    `);

    if (!queryRecipientData) {
      return {
        data: "Data Not Found",
        code: 400,
      };
    }

    // check crypto coin
    const {
      rows: [checkCoin],
    }: any = await db.raw(`
            SELECT
                crypto_id,
                crypto_type,
                crypto_amount
            FROM crypto_wallet 
            WHERE crypto_wallet_id = ${queryUserWallet.wallet_id} AND crypto_type = '${queryMarket.type_of_coin}'
            limit 1
            `);

    // amount of coin * currency
    const checkamout_money =
      queryMarket.type_of_coin === "BTC"
        ? (btc_coin_price * reqInit.coin_amount).toFixed(2)
        : queryMarket.type_of_coin === "ETC"
        ? (etc_coin_price * reqInit.coin_amount).toFixed(2)
        : queryMarket.type_of_coin === "XRP"
        ? (xrp_coin_price * reqInit.coin_amount).toFixed(2)
        : queryMarket.type_of_coin === "DOGE"
        ? (doge_coin_price * reqInit.coin_amount).toFixed(2)
        : 0;

    let transaction_id = 0

    const currentTime = moment().format();
    if (queryMarket.type_of_trading === "SELL") {
      // query for check coin of my-self

      if (checkamout_money > queryUserWallet.money_in_wallet) {
        return {
          data: "Not enough money in wallet",
          code: 400,
        };
      }
      // record in trasaction
      const {
        rows: [recordTransaction],
      }: any = await db.raw(`
      INSERT INTO trading_crypto(
        type_of_trading,
        trader_user_id,
        recipient_id,
        trading_amount,
        description,
        created_at,
        update_at,
        type_of_coin
      )VALUES(
        'SELL',
        ${queryUser.user_id},
        ${queryMarket.trader},
        ${reqInit.coin_amount},
        ${reqInit.description ? reqInit.description : null},
        '${currentTime}',
        '${currentTime}',
        '${queryMarket.type_of_coin}'
      )RETURNING transaction_id
      `);

      // update myself wallet in THB
      await db.raw(`
        UPDATE wallet SET
          money_in_wallet = ${
            reqInit.currency === "THB"
              ? queryUserWallet.money_in_wallet - Number(checkamout_money)
              : reqInit.currency === "USD"
              ? (exchangedMoney - Number(checkamout_money) / us_exchange) *
                us_exchange
              : 0
          },
          update_at = '${currentTime}'
          WHERE wallet_user_id = ${queryUser.user_id}
        `);

      //in case of haven't had coin yet (need to insert crypto coin)
      if (!checkCoin) {
        await db.raw(`
        INSERT INTO crypto_wallet(
            crypto_type,
            crypto_amount,
            crypto_wallet_id,
            created_at,
            update_at
        )VALUES(
            '${queryMarket.type_of_coin}',
            ${reqInit.coin_amount.toFixed(8)},
            ${queryUserWallet.wallet_id},
            '${currentTime}',
            '${currentTime}'
        )RETURNING crypto_id`);
      }

      // update myself crypto coin (in case of already have crypto coin)
      await db.raw(`
      UPDATE crypto_wallet SET
        crypto_amount = ${checkCoin.crypto_amount + reqInit.coin_amount},
        update_at = '${currentTime}'
      WHERE crypto_wallet_id = ${
        queryUserWallet.wallet_id
      } AND crypto_type = '${checkCoin.crypto_type}'
      `);

      // update recipient wallet
      await db.raw(`
      UPDATE wallet SET
        money_in_wallet = ${
          reqInit.currency === "THB"
            ? Number(checkamout_money) + queryRecipientData.money_in_wallet
            : reqInit.currency === "USD"
            ? ((Number(checkamout_money) / us_exchange) + (queryRecipientData.money_in_wallet/us_exchange)) *
              us_exchange
            : 0
        },
        update_at = '${currentTime}'
      WHERE wallet_user_id = ${queryRecipientData.user_id}
      `);

      // update recipient crypto coin
      await db.raw(`
      UPDATE crypto_wallet SET
        crypto_amount = ${
          queryRecipientData.crypto_amount - reqInit.coin_amount
        },
        update_at = '${currentTime}'
      WHERE crypto_wallet_id = ${
        queryRecipientData.wallet_id
      } AND crypto_type = '${queryRecipientData.crypto_type}'
      `);

      // check and update market
    } else {
      // check money of vendor that enough or not
      if (queryRecipientData.money_in_wallet < checkamout_money) {
        return {
          data: "Can not do this trasaction",
          code: 400,
        };
      }

      // check amount of coin
      if (checkCoin.crypto_amount < reqInit.coin_amount) {
        return {
          data: "Not enough coin",
          code: 400,
        };
      }

      // start transaction
      const {
        rows: [recordTransaction],
      }: any = await db.raw(`
          INSERT INTO trading_crypto(
            type_of_trading,
            trader_user_id,
            recipient_id,
            trading_amount,
            description,
            created_at,
            update_at,
            type_of_coin
          )VALUES(
            'BUY',
            ${queryUser.user_id},
            ${queryMarket.trader},
            ${reqInit.coin_amount},
            ${reqInit.description ? reqInit.description : null},
            '${currentTime}',
            '${currentTime}',
            '${queryMarket.type_of_coin}'
          )RETURNING transaction_id
          `);

      transaction_id = recordTransaction
      // update myself wallet
      await db.raw(`
      UPDATE wallet SET
        money_in_wallet = ${
          reqInit.currency === "THB"
            ? queryUserWallet.money_in_wallet + Number(checkamout_money)
            : reqInit.currency === "USD"
            ? (exchangedMoney + Number(checkamout_money) / us_exchange) *
              us_exchange
            : 0
        },
        update_at = '${currentTime}'
        WHERE wallet_user_id = ${queryUser.user_id}
      `);

      //in case of haven't had coin yet (need to insert crypto coin)
      if (!checkCoin) {
        await db.raw(`
        INSERT INTO crypto_wallet(
            crypto_type,
            crypto_amount,
            crypto_wallet_id,
            created_at,
            update_at
        )VALUES(
            '${queryMarket.type_of_coin}',
            ${reqInit.coin_amount.toFixed(8)},
            ${queryUserWallet.wallet_id},
            '${currentTime}',
            '${currentTime}'
        )RETURNING crypto_id`);
      }

      // update myself crypto coin (in case of already have crypto coin)
      await db.raw(`
      UPDATE crypto_wallet SET
        crypto_amount = ${checkCoin.crypto_amount - reqInit.coin_amount},
        update_at = '${currentTime}'
      WHERE crypto_wallet_id = ${
        queryUserWallet.wallet_id
      } AND crypto_type = '${checkCoin.crypto_type}'
      `);

      // update recipient wallet
      await db.raw(`
      UPDATE wallet SET
        money_in_wallet = ${
          reqInit.currency === "THB"
            ? queryRecipientData.money_in_wallet - Number(checkamout_money)
            : reqInit.currency === "USD"
            ? ((queryRecipientData.money_in_wallet / us_exchange) - (Number(checkamout_money) / us_exchange)) * us_exchange
            : 0
        },
        update_at = '${currentTime}'
      WHERE wallet_user_id = ${queryRecipientData.user_id}
      `);

      // update recipient crypto coin
      await db.raw(`
      UPDATE crypto_wallet SET
        crypto_amount = ${
          queryRecipientData.crypto_amount + reqInit.coin_amount
        },
        update_at = '${currentTime}'
      WHERE crypto_wallet_id = ${
        queryRecipientData.wallet_id
      } AND crypto_type = '${queryRecipientData.crypto_type}'
      `);
    }

    if (queryMarket.coin_amount - reqInit.coin_amount === 0) {
      await db.raw(`
        DELETE FROM market_place WHERE marketplace_id = ${reqInit.market_id}
        `);
    } else {
      await db.raw(`
        UPDATE market_place SET
          coin_amount = ${queryMarket.coin_amount - reqInit.coin_amount},
          price_th = ${
            queryMarket.type_of_coin === "BTC"
              ? (queryMarket.coin_amount - 1) * btc_coin_price
              : queryMarket.type_of_coin === "ETH"
              ? (queryMarket.coin_amount - 1) * etc_coin_price
              : queryMarket.type_of_coin === "XRP"
              ? (queryMarket.coin_amount - 1) * etc_coin_price
              : queryMarket.type_of_coin === "DOGE"
              ? (queryMarket.coin_amount - 1) * etc_coin_price
              : 0
          },
          price_us = ${
            queryMarket.type_of_coin === "BTC"
              ? ((queryMarket.coin_amount - 1) * btc_coin_price) / us_exchange
              : queryMarket.type_of_coin === "ETH"
              ? ((queryMarket.coin_amount - 1) * etc_coin_price) / us_exchange
              : queryMarket.type_of_coin === "XRP"
              ? ((queryMarket.coin_amount - 1) * etc_coin_price) / us_exchange
              : queryMarket.type_of_coin === "DOGE"
              ? ((queryMarket.coin_amount - 1) * etc_coin_price) / us_exchange
              : 0
          },
          updated_at = '${currentTime}'
        WHERE marketplace_id = ${reqInit.market_id}
        `);
    }

    return {
      data: {
        transaction_id : transaction_id,
        message: 'Transaction Successful'
      },
      code: 200,
    };
  }
}

const TradingController = new TradingCtr();
export default TradingController;
