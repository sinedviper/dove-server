import { Field, ID, InputType, ObjectType } from "type-graphql";

@InputType()
export class SignUpInput {
  @Field(() => String)
  public username!: string;

  @Field(() => String)
  public email!: string;

  @Field(() => String)
  public name!: string;

  @Field(() => String, { nullable: true })
  public surname?: string;

  @Field(() => String)
  public password!: string;
}

@InputType()
export class UpdateInput {
  @Field(() => String, { nullable: true })
  public username?: string;

  @Field(() => String, { nullable: true })
  public email?: string;

  @Field(() => String, { nullable: true })
  public name?: string;

  @Field(() => String, { nullable: true })
  public surname?: string;

  @Field(() => String, { nullable: true })
  public bio?: string;

  @Field(() => Boolean, { nullable: true })
  public theme?: boolean;

  @Field(() => Boolean, { nullable: true })
  public animation?: boolean;

  @Field(() => String, { nullable: true })
  public password?: string;

  @Field(() => String, { nullable: true })
  public passwordNew?: string;
}

@InputType()
export class UpdateInputOnline {
  @Field(() => String)
  public online!: String;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  public email!: string;

  @Field(() => String)
  public password!: string;
}

@InputType()
export class UserSearchInput {
  @Field(() => Number)
  public userId!: number;

  @Field(() => String)
  public username!: string;
}

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
