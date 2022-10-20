import { Request, Response } from "express";

import { UserModel } from "../models";

export interface IContext {
  req: Request;
  res: Response;
  deserializeUser: (req: Request) => Promise<UserModel | undefined>;
}
