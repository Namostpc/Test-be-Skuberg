import db from "../../database/db";
import { CreateCoins } from "../../models/index";
import { ICreateCryptoCoin } from "../../types/crpyto/crypto.ctr";
import moment from 'moment-timezone'



class CryptoCoin {
    async createCoin(req:any): Promise<any>{
        const reqInit:ICreateCryptoCoin = new CreateCoins(req.body, req.headers.token)

        if(!reqInit.token) {
            return {
                data: 'require token',
                code: 400
            }
        }

        if(!reqInit.user_id){
            return {
                data: 'Parameter is incomplete',
                code: 401
            }
        }

        if(!reqInit.crypto_type && !reqInit.crypto_amount){
            return {
                data: 'require parameters cryptp_type,crypto_amount',
                cpde: 400
            }
        }else if (!reqInit.crypto_type) {
            return {
                data: 'require parameters cryptp_type',
                cpde: 400
            }
        }else if (!reqInit.crypto_amount) {
            return {
                data: 'require parameters crypto_amount',
                cpde: 400
            }
        }

        const regExcrypto:RegExp = /^(BTC|ETH|XRP|DOGE)$/
        const regexTest = regExcrypto.test(reqInit.crypto_type)

        if(regexTest === false) {
            return {
                data: 'Type of coin invalid',
                code: 401
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

        const {rows: [queryUserWallet]}:any = await db.raw(`
        SELECT * FROM wallet WHERE wallet_user_id = ${queryUser.user_id} limit 1`)

        if(!queryUserWallet) {
            return {
                data: `Haven't create wallet yet`,
                code: 400
            }
        }

        const {rows: [queryExistCoin]}: any = await db.raw(`
        SELECT
            crypto_id,
            crypto_type
        FROM crypto_wallet
        WHERE crypto_wallet_id = ${queryUserWallet.wallet_id}
        limit 1
        `)

        if(queryExistCoin){
            if(queryExistCoin.crypto_type === reqInit.crypto_type){
                return {
                    data: 'crypto type has already created',
                    code: 400
                }
            }
        }

        const currentTime = moment().format()
        const {rows: [insertCoin]}: any = await db.raw(`
        INSERT INTO crypto_wallet(
            crypto_type,
            crypto_amount,
            crypto_wallet_id,
            created_at,
            update_at
        )VALUES(
            '${reqInit.crypto_type}',
            ${reqInit.crypto_amount},
            ${queryUserWallet.wallet_id},
            '${currentTime}',
            '${currentTime}'
        )RETURNING crypto_id
        `)


        return {
            data: {
                crypto_wallet_id: insertCoin.crypto_id,
                message: 'Create Successful'
            },
            code: 201
        }

    }
}

const CryptoCoinControlller = new CryptoCoin()

export default CryptoCoinControlller