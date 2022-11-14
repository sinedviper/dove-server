import { Field, ID, InputType, ObjectType } from "type-graphql";

@InputType()
export class ContactInput {
  @Field(() => Number)
  public userId!: number;

  @Field(() => Number)
  public contactId!: number;
}

@ObjectType()
class ContactData {
  @Field(() => ID)
  public id!: number;

  @Field(() => String)
  public username!: string;

  @Field(() => String)
  public email!: string;

  @Field(() => String)
  public name!: string;

  @Field(() => String)
  public surname!: string;

  @Field(() => Date)
  public online!: Date;

  @Field(() => String, { nullable: true })
  public bio?: string;

  @Field(() => Date)
  public createdAt!: Date;

  @Field(() => Date)
  public updatedAt!: Date;
}

@ObjectType()
export class ContactResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => [ContactData], { nullable: true })
  public data?: ContactData[];

  @Field(() => String, { nullable: true })
  public message?: string;
}
