import db from "../../database/db";
import { Authenlogin } from "../../models/index";
import { IAuthLogin } from "../../types/auth/auth.ctr";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


class Authen {
    async userLogin(req:any) : Promise<any> {
        const reqInit: IAuthLogin = new Authenlogin(req.body)

        if(!reqInit.email && !reqInit.password){
            return {
                data: 'Parameter is incompleted',
                code: 400
            }
        }else if (!reqInit.email || !reqInit.password){
            return {
                data: 'Parameter is incompleted',
                code: 400
            }
        }

        const {rows: queryuser} = await db.raw(`
        SELECT
            user_id,
            user_email,
            user_password
        FROM users
        WHERE user_email = '${reqInit.email}'
        `)
        
        const passwordMatch = await bcrypt.compare(reqInit.password, queryuser[0].user_password);

        if(queryuser.length === 0){
            return {
                data: 'user not found',
                code: 400
            }
        }

        if(!passwordMatch){
            return {
                data: 'incorrect password',
                code: 400
            }
        }
        

        const getToken = await jwt.sign({id: queryuser[0].user_id},process.env.SECERT_KEY || '123456789',{ expiresIn: '1h' })

        return {
            data: 'login successful',
            token: getToken,
            code: 200
        }
    }


}


const AuthenController = new Authen()
export default AuthenController;