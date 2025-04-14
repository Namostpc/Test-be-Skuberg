import { ICreateWallet } from "../../types/wallet/wallet.ctr";

class CreateWallet implements ICreateWallet {
    public token: string;
    public wallet_number: string;
    public wallet_amount: number;

    constructor(body:any, token:string) {
        this.token = token
        this.wallet_number = body.wallet_number
        this.wallet_amount = body.wallet_amount

    }


    
}

export {
    CreateWallet
}