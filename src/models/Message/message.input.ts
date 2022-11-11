import { Field, ID, InputType, ObjectType } from "type-graphql";

import { UserData } from "../User";
import { MessageModel } from "./message.model";

@InputType()
export class MessageInput {
  @Field(() => Number)
  senderMessage!: number;

  @Field(() => String)
  text!: string;

  @Field(() => Number)
  chatId!: number;
}

@InputType()
export class MessageDeleteInput {
  @Field(() => ID)
  id!: number;

  @Field(() => Number)
  chatId!: number;

  @Field(() => Number)
  senderMessage!: number;
}

@InputType()
export class MessageFindInput {
  @Field(() => Number)
  senderMessage: number;

  @Field(() => Number)
  chatId!: number;
}

@InputType()
export class MessageUpdateInput {
  @Field(() => ID)
  id!: number;

  @Field(() => Number)
  senderMessage: number;

  @Field(() => String)
  text!: string;
}

@ObjectType()
export class MessageData {
  @Field(() => ID)
  id!: number;

  @Field(() => UserData)
  senderMessage!: number;

  @Field(() => String)
  text!: string;

  @Field(() => Number)
  chatId!: number;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class MessageResponse {
  @Field(() => String)
  status!: string;

  @Field(() => [MessageModel], { nullable: true })
  data?: MessageModel[];

  @Field(() => String, { nullable: true })
  message?: string;
}
