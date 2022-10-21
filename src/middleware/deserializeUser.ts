import { IContext } from "./../interfaces/Context";
import { Request, Response } from "express";

import { UserService } from "../services";
import { verifyJwt } from "../utils";

const deserializeUser = async (
  req: Request,
  res: Response
): Promise<{ id: number | undefined; message: string }> => {
  try {
    // Get the access token
    let access_token: string;
    let userService = new UserService();

    if (req.headers.authorization) {
      access_token = req.headers.authorization;
    } else if (req.cookies?.access_token) {
      const { access_token: token } = req.cookies;
      access_token = token;
    }

    //Check the refresh token
    if (!access_token) {
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

// // Check if user exist
// const userRepo = AppDataSource.getRepository(UserModel);

// const user = await userRepo.findOne({
//   where: { id: Number(decoded.userId) },
// });

// if (!user) {
//   throw new ForbiddenError(
//     "The user belonging to this token no logger exist"
//   );
// }
