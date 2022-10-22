import { ForbiddenError } from "apollo-server-core";
import { CookieOptions } from "express";
import * as dotenv from "dotenv";
import * as bcrypt from "bcrypt";

import { IContext } from "../interfaces";
import {
  LoginInput,
  UserModel,
  SignUpInput,
  UpdateInput,
  UserData,
  UserLogin,
} from "../models";
import { AppDataSource, signJwt, verifyJwt } from "../utils";

dotenv.config();

export class UserService {
  // Cookie Options
  private accessTokenExpiresIn = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);
  private refreshTokenExpiresIn = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
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

  private async findByEmail(email: string): Promise<UserLogin | null> {
    const userRepo = AppDataSource.getRepository(UserModel);
    const user = userRepo
      .createQueryBuilder("users")
      .where("users.email = :email", { email })
      .getOne();
    return user as unknown as UserLogin;
  }

  private async findById(id: number): Promise<UserData | null> {
    const userRepo = AppDataSource.getRepository(UserModel);
    const user = userRepo
      .createQueryBuilder("users")
      .where("users.id = :id", { id })
      .getOne();
    return user as unknown as UserData;
  }

  private async findByIdAndDelete(id: number): Promise<string> {
    const userRepo = AppDataSource.getRepository(UserModel);
    await userRepo.delete({ id });

    return "success";
  }

  private async findByIdAndUpdate(
    id: number,
    input: UpdateInput
  ): Promise<string> {
    const userRepo = AppDataSource.getRepository(UserModel);
    const user = await userRepo.findOne({ where: { id } });
    let newUser = {};
    if (input.password && input.passwordNew) {
      const passwordHash = bcrypt.compareSync(input.password, user.password);
      if (!passwordHash) {
        return "invalid";
      }
      const salt = bcrypt.genSaltSync(Number(process.env.COST_FACTOR));
      const passwordHashi = bcrypt.hashSync(input.passwordNew, salt);
      newUser = { password: passwordHashi };
    }

    newUser = input.name ? { ...newUser, name: input.name } : { ...newUser };

    newUser = input.surname
      ? { ...newUser, surname: input.surname }
      : { ...newUser };

    newUser = input.username
      ? { ...newUser, username: input.username }
      : { ...newUser };
    newUser = input.email ? { ...newUser, email: input.email } : { ...newUser };

    await userRepo
      .createQueryBuilder()
      .update(UserModel)
      .set({ ...newUser })
      .where("id = :id", { id })
      .execute();

    return "success";
  }

  // Sign JWT Tokens
  private signTokens(user: UserData) {
    const userId: string = user.id.toString();

    const access_token = signJwt({ userId }, "accessTokenPrivateKey", {
      expiresIn: `${this.accessTokenExpiresIn}m`,
    });
    const refresh_token = signJwt({ userId }, "refreshTokenPrivateKey", {
      expiresIn: `${this.refreshTokenExpiresIn}m`,
    });

    return { access_token, refresh_token };
  }

  // Register User
  public async signUpUser({
    username,
    email,
    password,
    name,
    surname,
  }: SignUpInput) {
    try {
      const message = "The user already exists, replace the email or username";

      //Here take repository
      const userRepo = AppDataSource.getRepository(UserModel);

      //Found user in database because if it true that invalid
      const userCheckUsername = await userRepo.findOne({ where: { username } });
      if (userCheckUsername) {
        return {
          status: "invalid",
          message,
        };
      }
      //Repeate check
      const userCheckEmail = await userRepo.findOne({ where: { email } });
      if (userCheckEmail) {
        return {
          status: "invalid",
          message,
        };
      }

      //Hashing password
      const salt = bcrypt.genSaltSync(Number(process.env.COST_FACTOR));
      const passwordHash = bcrypt.hashSync(password, salt);
      const user = userRepo.create({
        username,
        email,
        name,
        surname,
        password: String(passwordHash),
      });

      //Save user in database
      await userRepo.save(user);

      return {
        status: "success",
        data: user,
        message: "User created!",
      };
    } catch (error: any) {
      if (error.code === 11000) {
        console.error("Email already exists");
      }
      console.error(error);
    }
  }

  // Login User
  public async loginUser(input: LoginInput, { res, req }: IContext) {
    try {
      const message = "Invalid email or password";

      // 1. Find user by email
      const user = await this.findByEmail(input.email);
      if (!user) {
        return {
          status: "invalid",
          message,
        };
      }

      //2. Compare passwords
      const passwordHash = bcrypt.compareSync(input.password, user.password);
      if (!passwordHash) {
        return {
          status: "invalid",
          message,
        };
      }

      // 3. Sign JWT Tokens
      const { access_token, refresh_token } = this.signTokens(user);

      // 4. Add Tokens to Context
      res.cookie("access_token", access_token, this.accessTokenCookieOptions);
      res.cookie(
        "refresh_token",
        refresh_token,
        this.refreshTokenCookieOptions
      );

      return {
        status: "success",
        access_token,
      };
    } catch (error: any) {
      console.error(error);
    }
  }

  // Get Currently Logged In User
  public async getMe({ req, res, autorization }: IContext) {
    try {
      //Check have user
      const { message, id } = await autorization(req, res);
      let user;

      //and if have we return it
      if (message == "success") {
        user = await this.findById(id);
        return {
          status: "success",
          data: user,
        };
      }

      return {
        status: "invalid",
        message,
      };
    } catch (error: any) {
      console.error(error);
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

      // Check if user exist and is verified
      const userRepo = AppDataSource.getRepository(UserModel);
      const user = await userRepo
        .createQueryBuilder("users")
        .where("users.id = :id", { id: decoded.userId })
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

      return {
        status: "success",
        access_token,
      };
    } catch (error) {
      console.error(error);
    }
  }

  // Logout User
  public async logoutUser({ req, res, autorization }: IContext) {
    try {
      const { message } = await autorization(req, res);
      if (message == "success") {
        // Logout user
        res.cookie("access_token", "", { maxAge: -1 });
        res.cookie("refresh_token", "", { maxAge: -1 });

        return { status: "success", message: "Logout" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Delete User
  public async deleteUser({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == "success") {
        // Logout user
        res.cookie("access_token", "", { maxAge: -1 });
        res.cookie("refresh_token", "", { maxAge: -1 });

        //Delete user
        this.findByIdAndDelete(id);

        return { status: "success", message: "Logout" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Update User
  public async updateUser(
    input: UpdateInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success") {
        //Delete user
        const mess = await this.findByIdAndUpdate(id, input);
        if (mess == "invalid") {
          return { status: "invalid", message: "Password uncorrect" };
        }

        return { status: "success", message: "User update" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }
}
