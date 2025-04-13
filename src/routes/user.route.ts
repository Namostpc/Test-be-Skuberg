import express, { Request, Response, Router } from 'express';
import {userController} from '../ctr/index'

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
    const result = await userController.createUser(req);
    res.json(result);
  });

router.get('/', async (req: Request, res: Response) => {
  const result = await userController.getUserme(req)
  res.json(result)
})


export default router