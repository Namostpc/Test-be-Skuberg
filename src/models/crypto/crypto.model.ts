import jwt from 'jsonwebtoken'
import { ICreateCryptoCoin } from '../../types/crpyto/crypto.ctr'


class CreateCoins implements ICreateCryptoCoin {
    public token: string
    public user_id: number | undefined
    public crypto_type: string
    public crypto_amount: number


    constructor(body:any , token:any) {
        this.token = token
        this.crypto_type = body.crypto_type
        this.crypto_amount = body.crypto_amount

        const tokenDecode:any = jwt.decode(token) as {id: number}

        if(tokenDecode){
            this.user_id = tokenDecode.id
        }

    }
}

export {
    CreateCoins
}