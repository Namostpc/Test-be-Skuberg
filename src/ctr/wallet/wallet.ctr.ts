import { CreateWallet, GetUserWallet } from "../../models/index";
import { ICreateWallet, IGetUserWallet } from "../../types/wallet/wallet.ctr";
import jwt from "jsonwebtoken";
import db from "../../database/db";
import moment from "moment-timezone";

class Wallet {
  async createWallet(req: any): Promise<any> {
    const reqInit: ICreateWallet = new CreateWallet(
      req.body,
      req.headers.token
    );

    if (!reqInit.token) {
      return {
        data: "require token",
        code: 400,
      };
    }

    if (!reqInit.wallet_number && !reqInit.wallet_amount) {
      return {
        data: "Parameter is incompleted",
        code: 400,
      };
    } else if (!reqInit.wallet_number || !reqInit.wallet_amount) {
      return {
        data: "Parameter is incompleted",
        code: 400,
      };
    }

    const tokenDecode = (await jwt.decode(reqInit.token)) as { id: number };

    const {
      rows: [queryUser],
    }: any = await db.raw(`
    SELECT * FROM users WHERE user_id = ${tokenDecode.id} limit 1`);
    if (!queryUser) {
      return {
        data: "User Not Found",
        code: 400,
      };
    }
    const {rows: [queryExistAccNo]}:any = await db.raw(`
    SELECT
        *
    FROM wallet
    WHERE wallet_number = '${reqInit.wallet_number}'
    LIMIT 1
    `)

    if (queryExistAccNo) {
      return {
        data: "This account number has already created",
        code: 400,
      };
    }


    const currentDate = moment().format();

    const { rows: [insertWalletData] }: any = await db.raw(`
        INSERT INTO wallet(
            wallet_number,
            money_in_wallet,
            wallet_user_id,
            created_at,
            update_at
        )VALUES(
            '${reqInit.wallet_number}',
            ${reqInit.wallet_amount},
            ${queryUser.user_id},
            '${currentDate}',
            '${currentDate}'
        ) RETURNING wallet_id`);

    return {
      data: {
        wallet_id: insertWalletData.wallet_id,
        message: "Create Successful",
      },
      code: 201,
    };
  }


  async getUserWallet(req: any) : Promise<any> {
    const reqInit:IGetUserWallet = new GetUserWallet(req.headers.token)
    console.log('reqInit ===', reqInit);

    if(!reqInit.token){
        return {
            data: 'Parameter is incompleted',
            code: 400
        }
    }

    if(!reqInit.user_id) {
        return {
            data: 'Parameter is incompleted',
            code: 400
        }
    }

    const {rows: [queryUser]}:any = await db.raw(`
    SELECT * FROM users WHERE user_id = ${reqInit.user_id} limit 1`)

    if(!queryUser) {
        return {
            data: 'User Not Found',
            code: 400
        }
    }

    const {rows: [queryWallet]}:any = await db.raw(`
    SELECT
        wallet_id,
        wallet_number,
        created_at,
        update_at
    FROM wallet
    WHERE wallet_user_id = ${reqInit.user_id} limit 1
    `)

    if(!queryWallet) {
        return {
            data: `Haven't create wallet yet`,
            code: 400
        }
    }

        const {rows: queryCoin}:any = await db.raw(`
        SELECT
            crypto_id,
            crypto_amount,
            crypto_type
        FROM crypto_wallet
        WHERE crypto_wallet_id = ${queryWallet.wallet_id}
        `)

    return {
        data: {
            wallet: queryWallet,
            crypto: queryCoin.length !== 0? queryCoin : []},
        code: 200
    }
    
  }
}

const WalletController = new Wallet();
export default WalletController;
