import jwt from 'jsonwebtoken'
import { ITrading } from '../../types/trading/trading.ctr'


class Trading implements ITrading {
    public token: string
    public coin_amount: number
    public user_id: number | undefined
    public market_id: number
    public description: string | undefined
    public currency: string



    constructor(token:string, body:any) {
        this.token = token
        this.coin_amount = body.coin_amount
        this.market_id = body.market_id
        this.currency = body.currency


        const tokenDecode = jwt.decode(token) as {id:number}

        if(tokenDecode) {
            this.user_id = tokenDecode.id
        }
    }
}

export {
    Trading
}