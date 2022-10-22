import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IsEmail, MaxLength, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @Field()
  username!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(1, { message: "Name must be at least 1 characters long" })
  @MaxLength(30, { message: "Name must be at most 30 characters long" })
  name!: string;

  @Field()
  @MinLength(1, { message: "Surname must be at least 1 characters long" })
  @MaxLength(30, { message: "Surname must be at most 30 characters long" })
  surname!: string;

  @Field()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  password!: string;
}

@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @MinLength(1, { message: "Name must be at least 1 characters long" })
  @MaxLength(30, { message: "Name must be at most 30 characters long" })
  name?: string;

  @Field({ nullable: true })
  @MinLength(1, { message: "Surname must be at least 1 characters long" })
  @MaxLength(30, { message: "Surname must be at most 30 characters long" })
  surname?: string;

  @Field({ nullable: true })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  password?: string;

  @Field({ nullable: true })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  passwordNew?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8, { message: "Invalid email or password" })
  @MaxLength(32, { message: "Invalid email or password" })
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
  name!: string;

  @Field()
  surname!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class UserLogin extends UserData {
  @Field()
  password!: string;
}

@ObjectType()
export class UserResponse {
  @Field()
  status!: string;

  @Field({ nullable: true })
  data?: UserData;

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
