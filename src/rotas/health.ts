import { Response } from "express";

export const health = (_, res: Response) => {
  res.status(200).send("OK");
};
