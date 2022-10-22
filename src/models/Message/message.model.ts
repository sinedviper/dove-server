import { ChatModel } from "./../Chat/chat.model";
import { UserModel } from "../User/user.model";
import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Column,
} from "typeorm";

@ObjectType()
@Entity({ name: "message" })
export class MessageModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "senderMessage" })
  public senderMessage!: Number;

  @Field(() => String)
  @Column()
  public text!: String;

  @Field(() => ChatModel)
  @ManyToOne(() => ChatModel, (chat: ChatModel) => chat.id)
  @JoinColumn({ name: "chatId" })
  public chatId!: Number;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;
}
