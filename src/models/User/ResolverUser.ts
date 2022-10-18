import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { AppDataSource } from "../../db";
import { CreateUserInput } from "./CreateUserInput";
import { Users } from "./Users";

@Resolver(() => Users)
export class ResolverUser {
  @Query(() => [Users])
  async getUsers(): Promise<Users[]> {
    const users = await AppDataSource.getRepository(Users).find({});
    return users;
  }

  @Mutation((_type) => Users)
  public async createUser(
    @Arg("user") { username, email, password }: CreateUserInput
  ): Promise<Users> {
    const userRepository = AppDataSource.getRepository(Users);
    const user = userRepository.create({ username, email, password });
    await userRepository.save(user);
    return user;
  }
}
