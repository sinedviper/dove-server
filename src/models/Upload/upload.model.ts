import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
} from "typeorm";

@ObjectType()
@Entity({ name: "upload" })
export class UploadModel extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field()
  @Column()
  public userUploadId!: number;

  @Field()
  @Column()
  public file!: string;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;
}
