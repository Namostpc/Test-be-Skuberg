import express, { Request, Response, Router } from "express";
import { SetmarketController } from "../ctr/index";

const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
  const result = await SetmarketController.setsell(req);
  res.json(result);
});

export default router;