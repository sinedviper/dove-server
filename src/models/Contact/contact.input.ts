import { Field, ID, InputType, ObjectType } from "type-graphql";

@InputType()
export class ContactInput {
  @Field(() => Number)
  userId!: number;

  @Field(() => Number)
  contactId!: number;
}

@ObjectType()
class ContactData {
  @Field(() => ID)
  id!: number;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  surname!: string;
}

@ObjectType()
export class ContactResponse {
  @Field(() => String)
  status!: string;

  @Field(() => [ContactData], { nullable: true })
  data?: ContactData[];

  @Field(() => String, { nullable: true })
  message?: string;
}
