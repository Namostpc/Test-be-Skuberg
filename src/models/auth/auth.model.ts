import { IAuthLogin } from "../../types/auth/auth.ctr";

class Authenlogin implements IAuthLogin {
    public email: string
    public password: string


    constructor(body:any) {
        this.email = body.email
        this.password = body.password
    }
}

export {
    Authenlogin
}