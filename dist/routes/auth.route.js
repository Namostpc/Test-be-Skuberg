"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../ctr/index");
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const result = await index_1.AuthenController.userLogin(req);
    res.json(result);
});
exports.default = router;
