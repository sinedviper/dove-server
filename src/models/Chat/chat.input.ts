import { Field, InputType } from "type-graphql";

@InputType()
export class ChatInput {
  @Field(() => Number)
  public sender!: number;

  @Field(() => Number)
  public recipient!: number;
}
