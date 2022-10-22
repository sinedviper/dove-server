import { Field, ID, InputType, ObjectType } from "type-graphql";
import { UserData } from "../User";

@InputType()
export class ChatInput {
  @Field(() => Number)
  public sender!: number;

  @Field(() => Number)
  public recipient!: number;

  @Field(() => Boolean, { nullable: true })
  public senderChat?: boolean;

  @Field(() => Boolean, { nullable: true })
  public recipientChat?: boolean;
}

// @ObjectType()
// export class ChatData {
//   @Field(() => ID)
//   id!: number;

//   @Field(() => Number)
//   public sender!: Number;

//   @Field(() => Number)
//   public recipient!: Number;

//   @Field(() => Boolean)
//   public senderChat!: boolean;

//   @Field(() => Boolean)
//   public recipientChat!: boolean;
// }

@ObjectType()
export class ChatResponse {
  @Field()
  status!: string;

  @Field(() => [UserData], { nullable: true })
  data?: UserData[];

  @Field({ nullable: true })
  message?: string;
}
