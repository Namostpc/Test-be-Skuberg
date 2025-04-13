"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenlogin = void 0;
class Authenlogin {
    email;
    password;
    constructor(body) {
        this.email = body.email;
        this.password = body.password;
    }
}
exports.Authenlogin = Authenlogin;
