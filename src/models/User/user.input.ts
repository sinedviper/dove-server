import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { UserModel } from "./user.model";
import { BaseEntity } from "typeorm";

@InputType()
export class SignUpInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password must be at most 32 characters long" })
  @Field()
  password!: string;
}

@InputType()
export class LoginInput {
  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(8, { message: "Invalid email or password" })
  @MaxLength(32, { message: "Invalid email or password" })
  @Field(() => String)
  password: string;
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

  @Field()
  user!: UserData;
}

@ObjectType()
export class LoginResponse {
  @Field()
  status!: string;

  @Field()
  access_token!: string;
}
