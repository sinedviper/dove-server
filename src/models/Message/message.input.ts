import { Field, ID, InputType, ObjectType } from "type-graphql";

import { ChatModel } from "../Chat";
import { UserData } from "../User";

@InputType()
export class MessageInput {
  @Field(() => ID, { nullable: true })
  public id?: number;

  @Field(() => Number)
  public senderMessage!: number;

  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => Number, { nullable: true })
  public reply?: number;

  @Field(() => Number)
  public chatId!: number;
}

@ObjectType()
export class MessageData {
  @Field(() => ID)
  public id!: number;

  @Field(() => UserData)
  public senderMessage!: number;

  @Field(() => String)
  public text!: string;

  @Field(() => ChatModel)
  public chatId!: number;

  @Field(() => MessageReply, { nullable: true })
  public reply?: number;

  @Field(() => Date)
  public createdAt!: Date;
}

@ObjectType()
export class MessageReply {
  @Field(() => ID)
  public id!: number;

  @Field(() => UserData)
  public senderMessage!: number;

  @Field(() => String)
  public text!: string;

  @Field(() => Date)
  public createdAt!: Date;
}

@ObjectType()
export class MessageResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => [MessageData], { nullable: true })
  public data?: MessageData[];

  @Field(() => String, { nullable: true })
  public message?: string;
}
