import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IsEmail, MaxLength, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  surname!: string;

  @Field(() => String)
  password!: string;
}

@InputType()
export class UpdateInput {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  surname?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  passwordNew?: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
export class UserData {
  @Field(() => ID)
  id!: number;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  surname!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class UserLogin extends UserData {
  @Field(() => String)
  password!: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => String)
  status!: string;

  @Field(() => UserData, { nullable: true })
  data?: UserData;

  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  access_token?: string;
}
