import { Response } from "express";

export const health = (_req, res: Response) => {
  res.status(200).send("OK");
};
