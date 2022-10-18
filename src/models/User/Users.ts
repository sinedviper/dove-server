import { Field, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { IUser } from "../../interfaces";

@ObjectType()
@Entity()
@Unique(["username", "email"])
export class Users extends BaseEntity {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  public readonly id!: number;

  @Field()
  @Column()
  public username!: string;

  @Field()
  @Column()
  public email!: string;

  @Field()
  @Column()
  public password!: string;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;

  @Field((_type) => [Users])
  @OneToMany((_type) => Users, (user: IUser) => user.username)
  public friends?: IUser[];
}
