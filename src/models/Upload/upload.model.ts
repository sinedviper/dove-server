import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { UserModel } from "../User";

@ObjectType()
@Entity({ name: "upload" })
export class UploadModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field(() => UserModel)
  @ManyToOne(() => UserModel, (user: UserModel) => user.id)
  @JoinColumn({ name: "userUploadId" })
  public userUploadId!: number;

  @Field()
  @Column()
  public file!: string;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;
}
