import { Field, InputType } from "type-graphql";

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
  @Field(() => String)
  public username!: string;
}
