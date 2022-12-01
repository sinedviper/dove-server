import { ObjectType, Field, ID } from "type-graphql";

import { ChatModel } from "../Chat";
import { UserData } from "../User";

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
  public dateUpdate!: Date;

  @Field(() => Boolean)
  public read!: boolean;

  @Field(() => Date)
  public createdAt!: Date;

  @Field(() => Date)
  public updatedAt!: Date;
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

@ObjectType()
export class MessageResponseHave {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => Date, { nullable: true })
  public data?: Date;

  @Field(() => String, { nullable: true })
  public message?: string;
}
