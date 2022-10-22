import { Request, Response } from "express";

import { UserService } from "../services";
import { verifyJwt } from "../utils";
import { IContext } from "../interfaces";

const deserializeUser = async (
  req: Request,
  res: Response
): Promise<{ id: number | undefined; message: string }> => {
  try {
    // Get the access token
    let access_token: string;
    let userService = new UserService();
    const accessHeaders: string = req.headers.authorization;
    const accessCookies: string = req.cookies?.access_token;

    if (accessHeaders) {
      if (accessHeaders == accessCookies) access_token = accessHeaders;
    }

    //Check the refresh token
    if (!access_token && !accessCookies) {
      if (req.cookies?.refresh_token) {
        const ctx = { req, res } as IContext;
        const access = await userService.refreshAccessToken(ctx);
        access_token = access.access_token;
      } else if (!req.cookies?.refresh_token) {
        return { id: undefined, message: "No access token found" };
      }
    }

    // Validate the Access token
    const decoded = verifyJwt<{ userId: string }>(
      access_token,
      "accessTokenPublicKey"
    );

    if (!decoded) {
      return { id: undefined, message: "Invalid access token" };
    }

    return { id: Number(decoded.userId), message: "success" };
  } catch (error: any) {
    console.error(error);
  }
};

export default deserializeUser;
