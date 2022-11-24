import { Field, InputType } from "type-graphql";

@InputType()
export class UploadInput {
  @Field(() => Number)
  public id!: number;
}
