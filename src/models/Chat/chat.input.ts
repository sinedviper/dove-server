import { Field, InputType, ObjectType } from "type-graphql";

import { UserData } from "../User";
import { MessageData } from "../Message/message.input";

@InputType()
export class ChatInput {
  @Field(() => Number)
  public sender!: number;

  @Field(() => Number)
  public recipient!: number;
}

@ObjectType()
export class Chats {
  @Field(() => Number)
  public id!: number;

  @Field(() => UserData)
  public user!: UserData;

  @Field(() => MessageData, { nullable: true })
  public lastMessage?: MessageData;
}

@ObjectType()
export class ChatResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => [Chats], { nullable: true })
  public data?: Chats[];

  @Field(() => String, { nullable: true })
  public message?: string;
}
