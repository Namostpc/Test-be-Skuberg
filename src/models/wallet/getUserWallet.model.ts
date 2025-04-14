import { IGetUserWallet } from "../../types/wallet/wallet.ctr";
import jwt from 'jsonwebtoken'

class GetUserWallet implements IGetUserWallet {
    public token: string
    public user_id: number | undefined
    public error: string | undefined


    constructor(token: string){
        this.token = token
        this.error = undefined


        const tokenDecode = jwt.decode(token) as {id: number}

        if(tokenDecode) {
            this.user_id = tokenDecode.id
        }

    }
}


export {
    GetUserWallet
}