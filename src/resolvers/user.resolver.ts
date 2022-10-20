import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  LoginInput,
  LoginResponse,
  SignUpInput,
  UserModel,
  UserResponse,
} from "../models";
import { UserService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => UserModel)
export class ResolverUser {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  // @Query(() => [UserModel])
  // async getUsers() {
  //   const userRepo = AppDataSource.getRepository(UserModel);
  //   const user = await userRepo.createQueryBuilder("users").where({}).getMany();

  //   return user;
  // }

  // @Query(() => UserModel)
  // async getUser(@Arg("email") email: string) {
  //   const userRepo = AppDataSource.getRepository(UserModel);

  //   const user = await userRepo
  //     .createQueryBuilder("users")
  //     .where("users.email = :email", { email })
  //     .getOne();

  //   return user;
  // }

  // @Mutation(() => UserModel)
  // public async createUser(
  //   @Arg("user") { username, email, password }: SignUpInput
  // ) {
  //   const userRepo = AppDataSource.getRepository(UserModel);
  //   const user = userRepo.create({ username, email, password });

  //   await userRepo.save(user).catch((err) => {
  //     console.log("Error: " + err);
  //   });

  //   return user;
  // }

  // @Mutation(() => String)
  // public async deleteUser(@Arg("id") id: number) {
  //   const userRepo = AppDataSource.getRepository(UserModel);
  //   await userRepo.delete({ id });

  //   return "User delete!";
  // }

  @Mutation(() => UserResponse)
  async signupUser(@Arg("input") input: SignUpInput) {
    return await this.userService.signUpUser(input);
  }

  @Mutation(() => LoginResponse)
  async loginUser(@Arg("input") loginInput: LoginInput, @Ctx() ctx: IContext) {
    return this.userService.loginUser(loginInput, ctx);
  }

  @Query(() => UserResponse)
  async getMe(@Ctx() ctx: IContext) {
    return this.userService.getMe(ctx);
  }

  @Query(() => LoginResponse)
  async refreshAccessToken(@Ctx() ctx: IContext) {
    return this.userService.refreshAccessToken(ctx);
  }

  @Query(() => Boolean)
  async logoutUser(@Ctx() ctx: IContext) {
    return this.userService.logoutUser(ctx);
  }
}
