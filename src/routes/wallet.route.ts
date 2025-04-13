import express, { Request, Response, Router } from 'express';
import {WalletController} from '../ctr/index'

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
    const result = await WalletController.createWallet(req);
    res.json(result);
  });


export default router