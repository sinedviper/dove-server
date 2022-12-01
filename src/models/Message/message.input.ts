import { Field, ID, InputType } from "type-graphql";

@InputType()
export class MessageInput {
  @Field(() => ID, { nullable: true })
  public id?: number;

  @Field(() => Number, { nullable: true })
  public senderMessage?: number;

  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => Number, { nullable: true })
  public reply?: number;

  @Field(() => Date, { nullable: true })
  public dataLastMessage?: Date;

  @Field(() => Number)
  public chatId!: number;
}
