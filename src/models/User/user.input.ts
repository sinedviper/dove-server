import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IsEmail, MaxLength, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  @Field()
  password!: string;
}

@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  @Field({ nullable: true })
  password?: string;

  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  @Field({ nullable: true })
  passwordNew?: string;
}

@InputType()
export class LoginInput {
  @IsEmail()
  @Field()
  email!: string;

  @MinLength(8, { message: "Invalid email or password" })
  @MaxLength(32, { message: "Invalid email or password" })
  @Field()
  password!: string;
}

@ObjectType()
export class UserData {
  @Field(() => ID)
  id!: number;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class UserResponse {
  @Field()
  status!: string;

  @Field({ nullable: true })
  user?: UserData;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  status!: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  access_token?: string;
}
