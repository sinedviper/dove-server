import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class UserData {
  @Field(() => ID)
  public id!: number;

  @Field(() => String)
  public username!: string;

  @Field(() => String)
  public email!: string;

  @Field(() => String)
  public name!: string;

  @Field(() => String, { nullable: true })
  public surname?: string;

  @Field(() => Date)
  public online!: Date;

  @Field(() => String, { nullable: true })
  public bio?: string;

  @Field(() => String, { nullable: true })
  public file?: string;

  @Field(() => Boolean)
  public theme!: boolean;

  @Field(() => Boolean)
  public animation!: boolean;

  @Field(() => Date)
  public createdAt!: Date;

  @Field(() => Date)
  public updatedAt!: Date;
}

@ObjectType()
export class UserLogin extends UserData {
  @Field(() => String)
  public password!: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => UserData, { nullable: true })
  public data?: UserData;

  @Field(() => String, { nullable: true })
  public message?: string;
}

@ObjectType()
export class UserSearchResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => [UserData], { nullable: true })
  public data?: UserData[];

  @Field(() => String, { nullable: true })
  public message?: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  public status!: string;

  @Field(() => Number)
  public code!: number;

  @Field(() => String, { nullable: true })
  public message?: string;

  @Field(() => String, { nullable: true })
  public access_token?: string;
}
