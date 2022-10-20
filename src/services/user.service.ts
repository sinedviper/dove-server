import {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
} from "apollo-server-core";
import config from "config";
import { CookieOptions } from "express";
import * as dotenv from "dotenv";

import { errorHandler } from "../controller";
import { IUser } from "../interfaces";
import deserializeUser from "../middleware/deserializeUser";
import { LoginInput, UserModel, SignUpInput } from "../models";
import { IContext } from "../interfaces";
import { AppDataSource, redisClient, signJwt, verifyJwt } from "../utils";

dotenv.config();

export class UserService {
  // Cookie Options
  private accessTokenExpiresIn = config.get<number>("accessTokenExpiresIn");
  private refreshTokenExpiresIn = config.get<number>("refreshTokenExpiresIn");
  private cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };
  private accessTokenCookieOptions = {
    ...this.cookieOptions,
    maxAge: this.accessTokenExpiresIn * 60 * 1000,
    expires: new Date(Date.now() + this.accessTokenExpiresIn * 60 * 1000),
  };
  private refreshTokenCookieOptions = {
    ...this.cookieOptions,
    maxAge: this.refreshTokenExpiresIn * 60 * 1000,
    expires: new Date(Date.now() + this.refreshTokenExpiresIn * 60 * 1000),
  };

  private async findByEmail(email: string): Promise<IUser | null> {
    const userRepo = AppDataSource.getRepository(UserModel);
    const user = userRepo
      .createQueryBuilder("users")
      .where("users.email = :email", { email })
      .getOne();
    return user as unknown as IUser;
  }

  // Sign JWT Tokens
  private signTokens(user: IUser) {
    const userId: string = user.id.toString();

    const access_token = signJwt({ userId }, "accessTokenPrivateKey", {
      expiresIn: `${this.accessTokenExpiresIn}m`,
    });

    const refresh_token = signJwt({ userId }, "refreshTokenPrivateKey", {
      expiresIn: `${this.refreshTokenExpiresIn}m`,
    });

    redisClient.set(userId, JSON.stringify(user), {
      EX: this.refreshTokenExpiresIn * 60,
    });

    return { access_token, refresh_token };
  }

  // Register User
  public async signUpUser({ username, email, password }: SignUpInput) {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);
      const user = userRepo.create({ username, email, password });
      await userRepo.save(user).catch((err) => {
        console.log("Error: " + err);
      });

      return {
        status: "success",
        user,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return new ValidationError("Email already exists");
      }
      errorHandler(error);
    }
  }

  // Login User
  public async loginUser(input: LoginInput, { res, req }: IContext) {
    try {
      const message = "Invalid email or password";
      // 1. Find user by email
      const user = await this.findByEmail(input.email);

      if (!user) {
        return new AuthenticationError(message);
      }

      //2. Compare passwords
      // if (!(await UserModel.comparePasswords(user.password, input.password))) {
      //   return new AuthenticationError(message);
      // }

      // 3. Sign JWT Tokens
      const { access_token, refresh_token } = this.signTokens(user);

      // 4. Add Tokens to Context
      res.cookie("access_token", access_token, this.accessTokenCookieOptions);
      res.cookie(
        "refresh_token",
        refresh_token,
        this.refreshTokenCookieOptions
      );
      res.cookie("logged_in", "true", {
        ...this.accessTokenCookieOptions,
        httpOnly: false,
      });

      return {
        status: "success",
        access_token,
      };
    } catch (error: any) {
      errorHandler(error);
    }
  }

  // Get Currently Logged In User
  public async getMe({ req, res, deserializeUser }: IContext) {
    try {
      const user = await deserializeUser(req);
      return {
        status: "success",
        user,
      };
    } catch (error: any) {
      errorHandler(error);
    }
  }

  // Refresh Access Token
  public async refreshAccessToken({ req, res }: IContext) {
    try {
      // Get the refresh token
      const { refresh_token } = req.cookies;

      // Validate the RefreshToken
      const decoded = verifyJwt<{ userId: string }>(
        refresh_token,
        "refreshTokenPublicKey"
      );

      if (!decoded) {
        throw new ForbiddenError("Could not refresh access token");
      }

      // Check if user's session is valid
      const session = await redisClient.get(decoded.userId);

      if (!session) {
        throw new ForbiddenError("User session has expired");
      }

      // Check if user exist and is verified
      const userRepo = AppDataSource.getRepository(UserModel);
      const user = await userRepo
        .createQueryBuilder("users")
        .where("users.id = :id", { id: JSON.parse(session).id })
        .getOne();

      if (!user) {
        throw new ForbiddenError("Could not refresh access token");
      }

      // Sign new access token
      const access_token = signJwt(
        { userId: user.id },
        "accessTokenPrivateKey",
        {
          expiresIn: `${this.accessTokenExpiresIn}m`,
        }
      );

      // Send access token cookie
      res.cookie("access_token", access_token, this.accessTokenCookieOptions);
      res.cookie("logged_in", "true", {
        ...this.accessTokenCookieOptions,
        httpOnly: false,
      });

      return {
        status: "success",
        access_token,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  // Logout User
  public async logoutUser({ req, res }: IContext) {
    try {
      const user = await deserializeUser(req);

      // Delete the user's session
      await redisClient.del(String(user?.id));

      // Logout user
      res.cookie("access_token", "", { maxAge: -1 });
      res.cookie("refresh_token", "", { maxAge: -1 });
      res.cookie("logged_in", "", { maxAge: -1 });

      return true;
    } catch (error) {
      errorHandler(error);
    }
  }
}
