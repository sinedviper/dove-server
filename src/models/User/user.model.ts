import { ContactModel } from "../Contact";
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

  @Field()
  @Column()
  public surname!: string;

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
}
