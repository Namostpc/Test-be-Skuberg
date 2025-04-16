import express, { Request, Response, Router } from "express";
import { TradingController } from "../ctr/index";

const router = express.Router();

router.post("/trading", async (req: Request, res: Response) => {
  const result = await TradingController.trading(req);
  res.json(result);
});

export default router;