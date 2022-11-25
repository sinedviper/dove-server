import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class UploadData {
  @Field(() => ID)
  public id!: number;

  @Field()
  public userUploadId!: number;

  @Field()
  public file!: string;

  @Field()
  public createdAt!: Date;
}

@ObjectType()
export class UploadResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => [UploadData], { nullable: true })
  public data?: UploadData[];

  @Field(() => String, { nullable: true })
  public message?: string;
}
