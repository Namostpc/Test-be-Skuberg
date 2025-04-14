

export interface ICreateWallet {
    token: string
    wallet_number: string
    wallet_amount: number
}

export interface IGetUserWallet {
    token: string
    user_id: number | undefined
    error: string | undefined
}