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
import { AppDataSource, signJwt } from "../utils";
import { invalid, success } from "../constants";

dotenv.config();

export class UserService {
  // Cookie Options
  private accessTokenExpiresIn = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);

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

    return success;
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
        return invalid;
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

    return success;
  }

  // Sign JWT Tokens
  private signTokens(user: UserData) {
    const userId: string = user.id.toString();

    const access_token = signJwt(
      { userId },
      {
        expiresIn: `${this.accessTokenExpiresIn}m`,
      }
    );

    return access_token;
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
          message: "Username must be between 3 and 40 characters",
        };
      }
      if (email.length < 3 || email.length > 40) {
        return {
          status: invalid,
          message: "Email must be between 3 and 40 characters",
        };
      }
      if (password.length < 8 || password.length > 40) {
        return {
          status: invalid,
          message: "Password must be between 8 and 40 characters",
        };
      }
      if (name.length < 1 || name.length > 30) {
        return {
          status: invalid,
          message: "Name must be between 1 and 40 characters",
        };
      }
      if (surname.length < 1 || surname.length > 30) {
        return {
          status: invalid,
          message: "Surname must be between 1 and 40 characters",
        };
      }
      //Here take repository
      const userRepo = AppDataSource.getRepository(UserModel);

      //Found user in database because if it true that invalid
      const userCheckUsername = await userRepo.findOne({ where: { username } });
      if (userCheckUsername) {
        return {
          status: invalid,
          message,
        };
      }
      //Repeate check
      const userCheckEmail = await userRepo.findOne({ where: { email } });
      if (userCheckEmail) {
        return {
          status: invalid,
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
        status: success,
        data: user,
        message: "User created!",
      };
    } catch (error: any) {
      console.error("Error created: " + error);
    }
  }

  // Login User
  public async loginUser(input: LoginInput) {
    try {
      const message = "Invalid email or password";
      if (input.email.length < 3 || input.email.length > 40) {
        return {
          status: invalid,
          message: "Email must be between 3 and 40 characters",
        };
      }
      if (input.password.length < 8 || input.password.length > 40) {
        return {
          status: invalid,
          message: "Password must be between 8 and 40 characters",
        };
      }
      // 1. Find user by email
      const user = await this.findByEmail(input.email);
      if (!user) {
        return {
          status: invalid,
          message,
        };
      }

      //2. Compare passwords
      const passwordHash = bcrypt.compareSync(input.password, user.password);
      if (!passwordHash) {
        return {
          status: invalid,
          message,
        };
      }

      // 3. Sign JWT Tokens
      const access_token = this.signTokens(user);

      if (!access_token) {
        return {
          status: invalid,
          message,
        };
      }

      return {
        status: success,
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

      //and if have we return it
      if (message == success) {
        const user = await this.findById(id);

        return {
          status: success,
          data: user,
        };
      }

      return {
        status: invalid,
        message: "user not found",
      };
    } catch (error: any) {
      console.error(error);
    }
  }

  //Delete User
  public async deleteUser({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == success) {
        // Logout user
        res.cookie("access_token", "", { maxAge: -1 });
        res.cookie("refresh_token", "", { maxAge: -1 });

        //Delete user
        this.findByIdAndDelete(id);

        return { status: success, message: "Logout" };
      }

      return { status: invalid, message };
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
      if (input.username)
        if (input.username.length < 3 || input.username.length > 30) {
          return {
            status: invalid,
            message: "Username must be between 3 and 30 characters",
          };
        }
      if (input.email)
        if (input.email.length < 3 || input.email.length > 40) {
          return {
            status: invalid,
            message: "Email must be between 3 and 40 characters",
          };
        }
      if (input.password)
        if (input.password.length < 8 || input.password.length > 40) {
          return {
            status: invalid,
            message: "Password must be between 8 and 40 characters",
          };
        }
      if (input.passwordNew)
        if (input.passwordNew.length < 8 || input.passwordNew.length > 40) {
          return {
            status: invalid,
            message: "Password must be between 8 and 40 characters",
          };
        }
      if (input.name)
        if (input.name.length < 1 || input.name.length > 30) {
          return {
            status: invalid,
            message: "Name must be between 1 and 40 characters",
          };
        }
      if (input.surname)
        if (input.surname.length < 1 || input.surname.length > 30) {
          return {
            status: invalid,
            message: "Surname must be between 1 and 40 characters",
          };
        }
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Delete user
        const mess = await this.findByIdAndUpdate(id, input);
        if (mess == invalid) {
          return { status: invalid, message: "Password uncorrect" };
        }

        return { status: success, message: "User update" };
      }

      return { status: invalid, message };
    } catch (error) {
      console.error(error);
    }
  }
}
