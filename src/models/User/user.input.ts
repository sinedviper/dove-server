import { Field, ID, InputType, ObjectType } from "type-graphql";

@InputType()
export class SignUpInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  surname?: string;

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
  bio?: string;

  @Field(() => Boolean, { nullable: true })
  theme?: boolean;

  @Field(() => Boolean, { nullable: true })
  animation?: boolean;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  passwordNew?: string;
}

@InputType()
export class UpdateInputOnline {
  @Field(() => Date)
  online!: String;
}

@InputType()
export class LoginInput {
  @Field(() => String)
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

  @Field(() => String, { nullable: true })
  surname?: string;

  @Field(() => Date)
  online!: Date;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => Boolean)
  theme!: boolean;

  @Field(() => Boolean)
  animation!: boolean;

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

  @Field(() => Number)
  code!: number;

  @Field(() => UserData, { nullable: true })
  data?: UserData;

  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  status!: string;

  @Field(() => Number)
  code!: number;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  access_token?: string;
}
