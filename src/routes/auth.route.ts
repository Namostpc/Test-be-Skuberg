import express, { Request, Response, Router } from 'express';
import {AuthenController} from '../ctr/index'

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    const result = await AuthenController.userLogin(req);
    res.json(result);
  });


export default router