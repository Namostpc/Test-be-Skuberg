import express, { Request, Response, Router } from 'express';
import {CryptoCoinControlller} from '../ctr/index'

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
    const result = await CryptoCoinControlller.createCoin(req);
    res.json(result);
  });


export default router