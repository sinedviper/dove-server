import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  LoginInput,
  LoginResponse,
  SignUpInput,
  UpdateInput,
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

  @Query(() => UserResponse)
  async logoutUser(@Ctx() ctx: IContext) {
    return this.userService.logoutUser(ctx);
  }

  @Mutation(() => UserResponse)
  async deleteUser(@Ctx() ctx: IContext) {
    return this.userService.deleteUser(ctx);
  }

  @Mutation(() => UserResponse)
  async updateUser(@Arg("input") input: UpdateInput, @Ctx() ctx: IContext) {
    return this.userService.updateUser(input, ctx);
  }
}
