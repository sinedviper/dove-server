import { Field, ID, InputType, ObjectType } from "type-graphql";

@InputType()
export class MessageInput {
  @Field(() => Number)
  userId!: number;

  @Field(() => Number)
  contactId!: number;
}

@ObjectType()
class MessageData {
  @Field(() => ID)
  id!: number;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  surname!: string;
}

@ObjectType()
export class MessageResponse {
  @Field()
  status!: string;

  // @Field(() => [ContactData], { nullable: true })
  // data?: ContactData[];

  @Field({ nullable: true })
  message?: string;
}
