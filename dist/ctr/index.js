"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenController = exports.userController = void 0;
const user_ctr_1 = __importDefault(require("./user/user.ctr"));
exports.userController = user_ctr_1.default;
const auth_ctr_1 = __importDefault(require("./auth/auth.ctr"));
exports.AuthenController = auth_ctr_1.default;
