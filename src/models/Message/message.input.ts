import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChatModel } from "../Chat";

import { UserData, UserModel } from "../User";
import { MessageModel } from "./message.model";

@InputType()
export class MessageInput {
  @Field(() => ID, { nullable: true })
  id?: number;

  @Field(() => Number)
  senderMessage!: number;

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => Number, { nullable: true })
  reply?: number;

  @Field(() => Number)
  chatId!: number;
}

@ObjectType()
export class MessageData {
  @Field(() => ID)
  id!: number;

  @Field(() => UserData)
  senderMessage!: number;

  @Field(() => String)
  text!: string;

  @Field(() => ChatModel)
  chatId!: number;

  @Field(() => MessageReply, { nullable: true })
  reply?: number;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class MessageReply {
  @Field(() => ID)
  id!: number;

  @Field(() => UserData)
  senderMessage!: number;

  @Field(() => String)
  text!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class MessageResponse {
  @Field(() => String)
  status!: string;

  @Field(() => [MessageData], { nullable: true })
  data?: MessageData[];

  @Field(() => String, { nullable: true })
  message?: string;
}
