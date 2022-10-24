import { Field, InputType, ObjectType } from "type-graphql";
import { UserData } from "../User";

@InputType()
export class ChatInput {
  @Field(() => Number)
  public sender!: number;

  @Field(() => Number)
  public recipient!: number;
}

@ObjectType()
export class ChatResponse {
  @Field(() => String)
  status!: string;

  @Field(() => [UserData], { nullable: true })
  data?: UserData[];

  @Field(() => String, { nullable: true })
  message?: string;
}
