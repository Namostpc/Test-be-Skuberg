import { IGetUserme } from "../../types/user/user.ctr";


class GetUserme implements IGetUserme {
    public token: string


    constructor(token: string){
        this.token = token
    }
}

export {
    GetUserme
}