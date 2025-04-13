"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
class CreateUser {
    userName;
    email;
    password;
    constructor(body) {
        this.userName = body.username;
        this.email = body.email;
        this.password = body.password;
    }
}
exports.CreateUser = CreateUser;
