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
  OneToMany,
  OneToOne,
} from "typeorm";

import { ChatModel } from "../Chat";
import { UserModel } from "../User";
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
  @Column("text")
  public text!: String;

  @Field(() => ChatModel)
  @ManyToOne(() => ChatModel, (chat: ChatModel) => chat.id)
  @JoinColumn({ name: "chatId" })
  public chatId!: Number;

  @Field(() => MessageModel, { nullable: true })
  @OneToOne(() => MessageModel, (reply: MessageModel) => reply.id, {
    nullable: true,
  })
  @JoinColumn({ name: "reply" })
  public reply?: MessageModel;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;

  // @OneToMany(() => MessageModel, (reply: MessageModel) => reply.reply, {
  //   nullable: true,
  // })
  // replyId: MessageModel[];
}
