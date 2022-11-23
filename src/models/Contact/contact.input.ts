import { Field, InputType } from "type-graphql";

@InputType()
export class ContactInput {
  @Field(() => Number)
  public userId!: number;

  @Field(() => Number)
  public contactId!: number;
}
