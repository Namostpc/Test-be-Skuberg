"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/index");
const db_1 = __importDefault(require("../../database/db"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class UserCtr {
    async createUser(req) {
        const reqInit = new index_1.CreateUser(req.body);
        if (!reqInit.userName && !reqInit.password && !reqInit.email) {
            return {
                data: "please insert data",
                code: 400,
            };
        }
        else if (!reqInit.userName) {
            return {
                data: "please insert username",
                code: 400,
            };
        }
        else if (!reqInit.password) {
            return {
                data: "please insert password",
                code: 400,
            };
        }
        else if (!reqInit.email) {
            return {
                data: "please insert email",
                code: 400,
            };
        }
        const currentTime = (0, moment_timezone_1.default)().format();
        const { rows: queryUser } = await db_1.default.raw(`
    SELECT
        user_id,
        user_name,
        user_email
    FROM users
    WHERE user_name = '${reqInit.userName}'`);
        if (queryUser.length !== 0) {
            return {
                data: 'This account already exist',
                code: 400
            };
        }
        //--- bcrypt password ----//
        // const salt = await bcrypt.genSalt();`    
        // const hashPassword = await bcrypt.hash(reqInit.password, salt)
        const { rows: insertData } = await db_1.default.raw(`
    INSERT INTO users (
        user_name,
        user_password,
        user_email,
        created_at,
        update_at
        ) 
        VALUES(
        '${reqInit.userName}',
        '${reqInit.password}',
        '${reqInit.email}',
        '${currentTime}',
        '${currentTime}'
        ) RETURNING user_id`);
        return {
            data: {
                id: insertData[0].user_id,
                message: 'Create successful'
            },
            code: 201,
        };
    }
    async getUserme(req) {
        const reqInit = new index_1.GetUserme(req.header.token);
        console.log('reqInit ===', reqInit);
        if (!reqInit.token) {
            return {
                data: 'Parameter is incompleted',
                code: 400
            };
        }
    }
}
const userController = new UserCtr();
exports.default = userController;
