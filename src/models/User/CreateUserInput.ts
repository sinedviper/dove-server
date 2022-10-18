import { Field, InputType } from "type-graphql";
import { Users } from "./Users";

@InputType()
export class CreateUserInput implements Partial<Users> {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}
