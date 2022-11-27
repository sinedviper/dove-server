import { UploadData } from "./../Upload/upload.object";
import { ObjectType, Field } from "type-graphql";

import { MessageData } from "../Message";
import { UserData } from "../User";

@ObjectType()
export class Chats {
  @Field(() => Number)
  public id!: number;

  @Field(() => UserData)
  public user!: UserData;

  @Field(() => MessageData, { nullable: true })
  public lastMessage?: MessageData;

  @Field(() => UploadData, { nullable: true })
  public image?: UploadData;
}

@ObjectType()
export class ChatResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => [Chats], { nullable: true })
  public data?: Chats[];

  @Field(() => String, { nullable: true })
  public message?: string;
}
