"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../database/db"));
const index_1 = require("../../models/index");
class Authen {
    async userLogin(req) {
        const reqInit = new index_1.Authenlogin(req.body);
        console.log('reqInit ===', reqInit);
        if (!reqInit.email && !reqInit.password) {
            return {
                data: 'Parameter is incompleted',
                code: 400
            };
        }
        else if (!reqInit.email || !reqInit.password) {
            return {
                data: 'Parameter is incompleted',
                code: 400
            };
        }
        const { rows: queryuser } = await db_1.default.raw(`
        SELECT
            user_id,
            user_email,
            user_password
        FROM users
        WHERE user_email = '${reqInit.email}'
        `);
        console.log('queryuser ===', queryuser[0]);
        if (queryuser.length === 0) {
            return {
                data: 'user not found',
                code: 400
            };
        }
        if (queryuser[0].user_password !== reqInit.password) {
            return {
                data: 'incorrect password',
                code: 400
            };
        }
        return {
            data: 'login successful',
            code: 200
        };
    }
}
const AuthenController = new Authen();
exports.default = AuthenController;
