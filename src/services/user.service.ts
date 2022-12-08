import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import * as bcrypt from "bcrypt";
import { CourierClient } from "@trycourier/courier";

import { IContext } from "../utils/interfaces";
import { AppDataSource, signJwt } from "../utils/helpers";
import { invalid, success } from "../utils/constants";
import { UploadModel } from "../models/Upload";
import {
  LoginInput,
  UserModel,
  SignUpInput,
  UpdateInput,
  UserData,
  UserLogin,
  UpdateInputOnline,
  UserSearchInput,
} from "../models/User";
import { autorizationConfirmation } from "../middleware";

dotenv.config();

export class UserService {
  // Cookie Options
  private accessTokenExpiresIn = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);

  private async findByEmail(email: string): Promise<UserLogin | null> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);
      const user = await userRepo
        .createQueryBuilder("users")
        .where("users.email = :email", { email })
        .getOne();

      return user as unknown as UserLogin;
    } catch (e) {
      console.log(e);
    }
  }

  private async findBySearchUsers(
    username: string
  ): Promise<UserData[] | null> {
    try {
      if (username === "") {
        return null;
      }
      const userRepo = AppDataSource.getRepository(UserModel);

      const users = await userRepo
        .createQueryBuilder("users")
        .where("users.username LIKE :username", { username: `%${username}%` })
        .limit(10)
        .getMany();

      const uploadRepo = AppDataSource.getRepository(UploadModel);

      let upload = await Promise.all(
        users.map(async (user: any) => {
          let img = await uploadRepo
            .createQueryBuilder("upload")
            .where("upload.userUploadId = :id", { id: user.id })
            .getMany();

          const image = img.sort(
            (a: any, b: any) =>
              Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )[0];

          if (image) user.file = image.file;

          return user;
        })
      );

      return upload as unknown as UserData[];
    } catch (e) {
      console.log(e);
    }
  }

  private async findBySearchUser(username: string): Promise<UserData | null> {
    try {
      if (username === "") {
        return null;
      }
      const userRepo = AppDataSource.getRepository(UserModel);

      let user: any = await userRepo
        .createQueryBuilder("users")
        .where("users.username = :username", { username })
        .getOne();

      const uploadRepo = AppDataSource.getRepository(UploadModel);
      let img = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.userUploadId = :id", { id: user.id })
        .getMany();

      const image = img.sort(
        (a: any, b: any) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      )[0];

      if (image) user.file = image.file;

      return user as unknown as UserData;
    } catch (e) {
      console.log(e);
    }
  }

  private async findById(id: number): Promise<UserData | string> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);

      const user = await userRepo
        .createQueryBuilder("users")
        .where("users.id = :id", { id })
        .getOne();

      if (!user) {
        return invalid;
      }

      return user as unknown as UserData;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  private async findByIdAndDelete(id: number): Promise<UserData | string> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);

      const uploadRepo = AppDataSource.getRepository(UploadModel);

      const upload = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.userUploadId = :id", { id })
        .getMany();

      await Promise.all(
        upload.map((img) => {
          const filePath = path.dirname("src") + "/src/images/" + img.file;
          fs.unlink(filePath, (err) => {
            if (err) console.log(err.message);
          });
          uploadRepo.delete({ id: Number(img?.id) });
        })
      );

      await userRepo.delete({ id });

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  private async findByIdAndUpdateConfirmation(id: number): Promise<string> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);
      if (!userRepo) {
        return invalid;
      }
      const user = await userRepo.findOne({ where: { id } });

      if (!user) {
        return invalid;
      }

      await userRepo
        .createQueryBuilder()
        .update(UserModel)
        .set({ confirmation: true })
        .where("id = :id", { id })
        .execute();

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  private async findByIdAndUpdate(
    id: number,
    input: UpdateInput
  ): Promise<string | UserData> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);
      if (!userRepo) {
        return invalid;
      }
      const user = await userRepo.findOne({ where: { id } });

      if (!user) {
        return invalid;
      }

      let newUser = {};
      if (input.password && input.passwordNew) {
        const passwordHash = bcrypt.compareSync(input.password, user.password);
        if (!passwordHash) {
          return invalid;
        }
        const salt = bcrypt.genSaltSync(Number(process.env.COST_FACTOR));
        const passwordHashi = bcrypt.hashSync(input.passwordNew, salt);
        newUser = { password: passwordHashi };
      }

      newUser = input.name ? { ...newUser, name: input.name } : { ...newUser };

      newUser =
        input.surname || input.surname == ""
          ? { ...newUser, surname: input.surname }
          : { ...newUser };

      newUser = input.username
        ? { ...newUser, username: input.username }
        : { ...newUser };

      newUser = input.email
        ? { ...newUser, email: input.email }
        : { ...newUser };

      newUser =
        input.bio !== null || input.bio !== undefined
          ? { ...newUser, bio: input.bio }
          : { ...newUser };

      newUser =
        input.theme === true || input.theme === false
          ? { ...newUser, theme: input.theme }
          : { ...newUser };

      newUser =
        input.animation === true || input.animation == false
          ? { ...newUser, animation: input.animation }
          : { ...newUser };

      await userRepo
        .createQueryBuilder()
        .update(UserModel)
        .set({ ...newUser })
        .where("id = :id", { id })
        .execute();

      const userUpdate = await userRepo
        .createQueryBuilder("users")
        .where("users.id = :id", { id })
        .getOne();

      if (!userUpdate) {
        return invalid;
      }

      return userUpdate as unknown as UserData;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  private async findByIdAndUpdateOnline(
    id: number
  ): Promise<UserData | string> {
    try {
      const userRepo = AppDataSource.getRepository(UserModel);

      if (!userRepo) {
        return invalid;
      }

      await userRepo
        .createQueryBuilder()
        .update(UserModel)
        .set({ online: new Date() })
        .where("id = :id", { id })
        .execute();

      const userUpdate = await userRepo
        .createQueryBuilder("users")
        .where("users.id = :id", { id })
        .getOne();

      if (!userUpdate) {
        return invalid;
      }

      return userUpdate as unknown as UserData;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  // Sign JWT Tokens
  private signTokens(user: UserLogin) {
    try {
      const userId: string = user.id.toString();

      const access_token = signJwt(
        { userId },
        {
          expiresIn: `${this.accessTokenExpiresIn}m`,
        }
      );

      return access_token;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //----------------------------------------------------Public function-----------------------------------------------------------
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
      if (username.length < 3 || username.length > 40) {
        return {
          status: invalid,
          code: 400,
          message: "Username must be between 3 and 40 characters",
        };
      }
      if (email.length < 3 || email.length > 40) {
        return {
          status: invalid,
          code: 400,
          message: "Email must be between 3 and 40 characters",
        };
      }
      if (password.length < 8 || password.length > 40) {
        return {
          status: invalid,
          code: 400,
          message: "Password must be between 8 and 40 characters",
        };
      }
      if (name.length < 1 || name.length > 30) {
        return {
          status: invalid,
          code: 400,
          message: "Name must be between 1 and 40 characters",
        };
      }
      if (surname.length > 30) {
        return {
          status: invalid,
          code: 400,
          message: "Surname must be not more 40 characters",
        };
      }
      //Here take repository
      const userRepo = AppDataSource.getRepository(UserModel);

      //Found user in database because if it true that invalid
      const userCheckUsername = await userRepo.findOne({ where: { username } });
      if (userCheckUsername) {
        return {
          status: invalid,
          code: 404,
          message,
        };
      }
      //Repeate check
      const userCheckEmail = await userRepo.findOne({ where: { email } });
      if (userCheckEmail) {
        return {
          status: invalid,
          code: 404,
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
        confirmation: false,
        bio: "",
        online: new Date(),
        theme: false,
        animation: false,
        password: String(passwordHash),
      });

      //Save user in database
      await userRepo.save(user);

      const courier = CourierClient({
        authorizationToken: process.env.TOKENMAIL,
      });

      const code = this.signTokens(user);

      await courier.send({
        message: {
          content: {
            title: "Welcome to Dove!",
            body: "Please verify your Dove account, use this code\n\n {{code}}  \n\nand follow the link: https://dove-client.vercel.app/confirmation",
          },
          data: {
            code,
          },
          to: {
            email,
          },
        },
      });

      return {
        status: success,
        code: 201,
        message: "User created!",
      };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  // Login User
  public async loginUser(input: LoginInput) {
    try {
      const message = "Invalid email or password";
      if (input.email.length < 3 || input.email.length > 40) {
        return {
          status: invalid,
          code: 400,
          message: "Email must be between 3 and 40 characters",
        };
      }
      if (input.password.length < 8 || input.password.length > 40) {
        return {
          status: invalid,
          code: 400,
          message: "Password must be between 8 and 40 characters",
        };
      }
      // 1. Find user by email
      const user: UserLogin = await this.findByEmail(input.email);
      if (!user) {
        return {
          status: invalid,
          code: 404,
          message,
        };
      }

      //2. Compare passwords
      const passwordHash = bcrypt.compareSync(input.password, user.password);
      if (!passwordHash) {
        return {
          status: invalid,
          code: 400,
          message,
        };
      }

      if (user.confirmation === undefined) {
        return {
          status: invalid,
          code: 400,
          message: "You can use your account",
        };
      }

      //verification mail
      if (user.confirmation === false) {
        return {
          status: invalid,
          code: 400,
          message: "Please confirmation your account",
        };
      }

      // 3. Sign JWT Tokens
      const access_token = this.signTokens(user);

      if (!access_token) {
        return {
          status: invalid,
          code: 401,
          message,
        };
      }

      return {
        status: success,
        code: 200,
        access_token,
      };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  // Get Currently Logged In User
  public async getMe({ req, res, autorization }: IContext) {
    try {
      //Check have user
      const { message, id } = await autorization(req, res);

      //and if have we return it
      if (message == success) {
        const data = await this.findById(id);
        return {
          status: success,
          code: 200,
          data,
        };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
  //confirmation account
  public async confirmationAccount(access_token: string) {
    try {
      //Check have user
      const { message, id } = await autorizationConfirmation(access_token);
      //and if have we return it
      if (message == success) {
        const data = await this.findByIdAndUpdateConfirmation(id);

        if (data === invalid) {
          return {
            status: invalid,
            code: 400,
            message: "Can't confirmation your account",
          };
        }

        if (data === success) {
          return {
            status: success,
            code: 200,
            access_token,
          };
        }
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Delete User
  public async deleteUser({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == success) {
        //Delete user
        this.findByIdAndDelete(id);

        return { status: success, code: 200, message: "Logout" };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Update User
  public async updateUser(
    input: UpdateInput,
    { req, res, autorization }: IContext
  ) {
    try {
      if (input.username)
        if (input.username.length < 3 || input.username.length > 30) {
          return {
            status: invalid,
            code: 400,
            message: "Username must be between 3 and 30 characters",
          };
        }
      if (input.email)
        if (input.email.length < 3 || input.email.length > 40) {
          return {
            status: invalid,
            code: 400,
            message: "Email must be between 3 and 40 characters",
          };
        }
      if (input.password)
        if (input.password.length < 8 || input.password.length > 40) {
          return {
            status: invalid,
            code: 400,
            message: "Password must be between 8 and 40 characters",
          };
        }
      if (input.passwordNew)
        if (input.passwordNew.length < 8 || input.passwordNew.length > 40) {
          return {
            status: invalid,
            code: 400,
            message: "Password must be between 8 and 40 characters",
          };
        }
      if (input.name)
        if (input.name.length < 1 || input.name.length > 40) {
          return {
            status: invalid,
            code: 400,
            message: "Name must be between 1 and 40 characters",
          };
        }
      if (input.surname)
        if (input.surname.length > 40) {
          return {
            status: invalid,
            code: 400,
            message: "Surname must be not more 40 characters",
          };
        }
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Update user
        const data = await this.findByIdAndUpdate(id, input);
        if (data == invalid) {
          return { status: invalid, code: 404, message: "Update faile" };
        }

        return { status: success, code: 200, data, message: "User update" };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
  //Update User
  public async updateUserOnline(
    input: UpdateInputOnline,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        if (input.online !== "ping") {
          return { status: invalid, code: 400, message: "Uncorrect" };
        }
        //Update user
        const data = await this.findByIdAndUpdateOnline(id);
        if (data == invalid) {
          return { status: invalid, code: 404, message: "Update faile" };
        }

        return { status: success, code: 200, data, message: "User update" };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  // Get search user
  public async getSearchUser(
    input: UserSearchInput,
    { req, res, autorization }: IContext
  ) {
    try {
      //Check have user
      const { message } = await autorization(req, res);

      //and if have we return it
      if (message == success) {
        const data = await this.findBySearchUsers(input.username);

        return {
          status: success,
          code: 200,
          data,
        };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  // Get search user
  public async getUser(
    input: UserSearchInput,
    { req, res, autorization }: IContext
  ) {
    try {
      //Check have user
      const { message } = await autorization(req, res);
      //and if have we return it
      if (message == success) {
        const data = await this.findBySearchUser(input.username);

        return {
          status: success,
          code: 200,
          data,
        };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Send bugs report
  public async sendReport(text: string, { req, res, autorization }: IContext) {
    try {
      //Check have user
      const { message, id } = await autorization(req, res);

      //and if have we return it
      if (message == success) {
        const data: any = await this.findById(id);

        if (data === invalid) {
          return {
            status: invalid,
            code: 400,
            message: "I can't send",
          };
        }

        const courier = CourierClient({
          authorizationToken: process.env.TOKENMAIL,
        });

        await courier.send({
          message: {
            content: {
              title: "Welcome to Dove!",
              body: "Username: {{username}}\n Email: {{email}}\n {{text}}",
            },
            data: {
              text,
              username: data?.username,
              email: data?.email,
            },
            to: {
              email: "sinedviper@gmail.com",
            },
          },
        });

        return {
          status: success,
          code: 200,
          message: "Success",
        };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
}
