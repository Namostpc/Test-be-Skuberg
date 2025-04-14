import { ISetsellmarket } from "../../types/market/market.ctr";
import jwt from 'jsonwebtoken'

class SetsellMarket implements ISetsellmarket {
    public token: string;
    public user_id: number | undefined
    public type_of_coin: string;
    public coin_amount: number;


    constructor(body:any, token:string) {
        this.token = token
        this.type_of_coin = body.type_of_coin
        this.coin_amount = body.coin_amount


        const tokenDecode = jwt.decode(token) as {id: number}
        if(tokenDecode) {
            this.user_id = tokenDecode.id
        }
    }
}

export {
    SetsellMarket
}