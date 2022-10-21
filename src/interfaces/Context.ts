import { Request, Response } from "express";

export interface IContext {
  req: Request;
  res: Response;
  deserializeUser: (
    req: Request,
    res: Response
  ) => Promise<{ id: number | null; message: string } | undefined>;
}
