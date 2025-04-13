import { GetUserme, CreateUser } from "../../models/index";
import { ICreateUser, IGetUserme } from "../../types/user/user.ctr";

import db from "../../database/db";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserCtr {
  async createUser(req: any): Promise<any> {
    const reqInit: ICreateUser = new CreateUser(req.body);
    if (!reqInit.userName && !reqInit.password && !reqInit.email) {
      return {
        data: "please insert data",
        code: 400,
      };
    } else if (!reqInit.userName) {
      return {
        data: "please insert username",
        code: 400,
      };
    } else if (!reqInit.password) {
      return {
        data: "please insert password",
        code: 400,
      };
    } else if (!reqInit.email) {
      return {
        data: "please insert email",
        code: 400,
      };
    }

    const currentTime = moment().format();

    const { rows: queryUser } = await db.raw(`
    SELECT
        user_id,
        user_name,
        user_email
    FROM users
    WHERE user_name = '${reqInit.userName}'`);

    if (queryUser.length !== 0) {
      return {
        data: "This account already exist",
        code: 400,
      };
    }

    //--- bcrypt password ----//
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(reqInit.password, salt);

    const { rows: insertData } = await db.raw(`
    INSERT INTO users (
        user_name,
        user_password,
        user_email,
        created_at,
        update_at
        ) 
        VALUES(
        '${reqInit.userName}',
        '${hashPassword}',
        '${reqInit.email}',
        '${currentTime}',
        '${currentTime}'
        ) RETURNING user_id`);

    return {
      data: {
        id: insertData[0].user_id,
        message: "Create successful",
      },
      code: 201,
    };
  }

  async getUserme(req: any): Promise<any> {
    const reqInit: IGetUserme = new GetUserme(req.headers.token);

    if (!reqInit.token) {
      return {
        data: "require token",
        code: 400,
      };
    }

    const tokenDecode = (await jwt.decode(reqInit.token)) as { id: number };
    const {
      rows: [queryUser],
    } = await db.raw(`
    SELECT
        *
    FROM users
    WHERE user_id = ${tokenDecode.id}
    LIMIT 1`);

    if (!queryUser) {
      return {
        data: "User Not Found",
        code: 400,
      };
    }

    const {
      rows: [queryWallet],
    }: any = await db.raw(`
    SELECT
        wallet_id,
        wallet_number
    FROM wallet
    WHERE wallet_user_id = ${queryUser.user_id}
    limit 1
    `);

    const schema = {
      user_id: queryUser.user_id,
      user_name: queryUser.user_name,
      user_email: queryUser.user_email,
      wallet_data: queryWallet ? queryWallet : {}
    };

    return {
      data: schema,
      code: 200,
    };
  }
}

const userController = new UserCtr();
export default userController;
