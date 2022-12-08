import { UserLogin } from "./../models/User/user.object";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  UserModel,
  UserResponse,
  UserSearchResponse,
  UserSearchInput,
  SignUpInput,
  LoginResponse,
  LoginInput,
  UpdateInput,
  UpdateInputOnline,
} from "../models/User";
import { UserService } from "../services";
import { IContext } from "../utils/interfaces";

@Resolver(() => UserModel)
export class ResolverUser {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Query(() => UserResponse)
  async getMe(@Ctx() ctx: IContext) {
    return await this.userService.getMe(ctx);
  }

  @Query(() => UserSearchResponse)
  async searchUsers(
    @Arg("input") input: UserSearchInput,
    @Ctx() ctx: IContext
  ) {
    return await this.userService.getSearchUser(input, ctx);
  }

  @Query(() => UserResponse)
  async getUser(@Arg("input") input: UserSearchInput, @Ctx() ctx: IContext) {
    return await this.userService.getUser(input, ctx);
  }

  @Mutation(() => UserResponse)
  async signupUser(@Arg("input") input: SignUpInput) {
    return await this.userService.signUpUser(input);
  }

  @Mutation(() => LoginResponse)
  async confirmationUser(@Arg("token") token: string) {
    return await this.userService.confirmationAccount(token);
  }

  @Mutation(() => LoginResponse)
  async sendReport(@Arg("text") text: string, @Ctx() ctx: IContext) {
    return await this.userService.sendReport(text, ctx);
  }

  @Mutation(() => LoginResponse)
  async loginUser(@Arg("input") loginInput: LoginInput) {
    return await this.userService.loginUser(loginInput);
  }

  @Mutation(() => UserResponse)
  async deleteUser(@Ctx() ctx: IContext) {
    return await this.userService.deleteUser(ctx);
  }

  @Mutation(() => UserResponse)
  async updateUser(@Arg("input") input: UpdateInput, @Ctx() ctx: IContext) {
    return await this.userService.updateUser(input, ctx);
  }

  @Mutation(() => UserResponse)
  async updateUserOnline(
    @Arg("input") input: UpdateInputOnline,
    @Ctx() ctx: IContext
  ) {
    return await this.userService.updateUserOnline(input, ctx);
  }
}
