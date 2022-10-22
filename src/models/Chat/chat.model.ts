import { MessageModel } from "./../Message/message.model";
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
  OneToMany,
} from "typeorm";

@ObjectType()
@Entity({ name: "chat" })
export class ChatModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "sender" })
  public sender!: Number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "recipient" })
  public recipient!: Number;

  @Field(() => Boolean)
  @Column()
  public senderChat!: boolean;

  @Field(() => Boolean)
  @Column()
  public recipientChat!: boolean;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;

  @OneToMany(() => MessageModel, (message: MessageModel) => message.chatId)
  chatId: MessageModel[];
}
