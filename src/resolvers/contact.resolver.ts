import {
  Arg,
  Ctx,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";

import { ContactResponse, ContactModel, ContactInput } from "../models";
import { ContactService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => ContactModel)
export class ResolverContact {
  constructor(private contactService: ContactService) {
    this.contactService = new ContactService();
  }

  @Subscription({
    topics: "Contact",
  })
  contactSubscription(@Root() payload: ContactResponse): ContactResponse {
    return payload;
  }

  @Query(() => ContactResponse)
  async getContacts(@Ctx() ctx: IContext) {
    return this.contactService.findContacts(ctx);
  }

  @Mutation(() => Boolean)
  async addContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Contact",
      await this.contactService.addContact(contact, ctx)
    );
    return true;
  }

  @Mutation(() => Boolean)
  async deleteContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Contact",
      await this.contactService.deleteContact(contact, ctx)
    );
    return true;
  }
}
