import { Field, ID, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";

import { MessageModel } from "../Message";
import { ChatModel } from "../Chat";
import { ContactModel } from "../Contact";

@ObjectType()
@Entity({ name: "users" })
export class UserModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field()
  @Column({ unique: true })
  public username!: string;

  @Field()
  @Column({ unique: true })
  public email!: string;

  @Field()
  @Column()
  public name!: string;

  @Field(() => String, { nullable: true })
  @Column()
  public surname?: string;

  @Field(() => Date)
  @Column()
  public online!: Date;

  @Field(() => String, { nullable: true })
  @Column()
  public bio?: string;

  @Field(() => Boolean)
  @Column()
  public theme!: boolean;

  @Field(() => Boolean)
  @Column()
  public animation!: boolean;

  @Field()
  @Column()
  public password!: string;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;

  @OneToMany(() => ContactModel, (contact: ContactModel) => contact.userId)
  userId: ContactModel[];

  @OneToMany(() => ContactModel, (contact: ContactModel) => contact.contactId)
  contactId: ContactModel[];

  @OneToMany(() => ChatModel, (chat: ChatModel) => chat.sender)
  sender: ChatModel[];

  @OneToMany(() => ChatModel, (chat: ChatModel) => chat.recipient)
  recipient: ChatModel[];

  @OneToMany(
    () => MessageModel,
    (message: MessageModel) => message.senderMessage
  )
  senderMessage: MessageModel[];
}
