import {
  Arg,
  Ctx,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";

import {
  LoginInput,
  LoginResponse,
  SignUpInput,
  UpdateInput,
  UserModel,
  UserResponse,
  UpdateInputOnline,
  UserSearchInput,
} from "../models";
import { UserService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => UserModel)
export class ResolverUser {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Subscription({
    topics: "User",
  })
  userSubscription(@Root() payload: UserResponse): UserResponse {
    return payload;
  }

  @Query(() => Boolean)
  async getMe(@Ctx() ctx: IContext, @PubSub() pubsub: PubSubEngine) {
    pubsub.publish("User", await this.userService.getMe(ctx));
    return true;
  }

  @Mutation(() => UserResponse)
  async signupUser(@Arg("input") input: SignUpInput) {
    return await this.userService.signUpUser(input);
  }

  @Mutation(() => LoginResponse)
  async loginUser(@Arg("input") loginInput: LoginInput) {
    return await this.userService.loginUser(loginInput);
  }

  @Mutation(() => UserResponse)
  async deleteUser(@Ctx() ctx: IContext) {
    return await this.userService.deleteUser(ctx);
  }

  @Mutation(() => Boolean)
  async updateUser(
    @Arg("input") input: UpdateInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("User", await this.userService.updateUser(input, ctx));
    return true;
  }

  @Mutation(() => Boolean)
  async updateUserOnline(
    @Arg("input") input: UpdateInputOnline,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("User", await this.userService.updateUserOnline(input, ctx));
    return true;
  }

  @Mutation(() => UserResponse)
  async searchUsers(
    @Arg("input") input: UserSearchInput,
    @Ctx() ctx: IContext
  ) {
    return await this.userService.getSearchUser(input, ctx);
  }
}
