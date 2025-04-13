import { CreateWallet } from "../../models/index";
import { ICreateWallet } from "../../types/wallet/wallet.ctr";
import jwt from "jsonwebtoken";
import db from "../../database/db";
import moment from "moment-timezone";

class Wallet {
  async createWallet(req: any): Promise<any> {
    const reqInit: ICreateWallet = new CreateWallet(
      req.body,
      req.headers.token
    );
    console.log("reqInit ====", reqInit);

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
    console.log("tokenDecode ===", tokenDecode.id);

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

    const { rows: queryWallet }: any = await db.raw(`
    SELECT
        u.user_id,
        u.user_name,
        u.user_email,
        w.wallet_id,
        w.wallet_number,
        w.money_in_wallet
    FROM users as u
    INNER JOIN wallet as w ON w.wallet_user_id = u.user_id
    WHERE u.user_id = ${queryUser.user_id} 
    `);

    console.log("queryWallet ===", queryWallet);
    if (queryWallet.length !== 0) {
      return {
        data: "This account already have wallet account",
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
}

const WalletController = new Wallet();
export default WalletController;
