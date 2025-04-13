import { ICreateUser } from "../../types/user/user.ctr";



class CreateUser implements ICreateUser{
    public userName: string;
    public email: string;
    public password: string;


    constructor(body: any){
        this.userName = body.username
        this.email = body.email
        this.password = body.password

    }

    

}


export {
    CreateUser
} 