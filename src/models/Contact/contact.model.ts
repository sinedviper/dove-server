import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
} from "typeorm";

import { UserModel } from "../User";

@ObjectType()
@Entity({ name: "contact" })
export class ContactModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "userId" })
  public userId!: Number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "contactId" })
  public contactId!: Number;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;
}
