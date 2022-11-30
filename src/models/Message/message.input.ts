import { Field, ID, InputType } from "type-graphql";

@InputType()
export class MessageInput {
  @Field(() => ID, { nullable: true })
  public id?: number;

  @Field(() => Number)
  public senderMessage!: number;

  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => Boolean, { nullable: true })
  public read?: boolean;

  @Field(() => Number, { nullable: true })
  public reply?: number;

  @Field(() => Number)
  public chatId!: number;
}
