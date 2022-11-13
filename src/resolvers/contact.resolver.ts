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
  async getContacts(@Ctx() ctx: IContext, @PubSub() pubsub: PubSubEngine) {
    pubsub.publish("Contact", this.contactService.findContacts(ctx));
    return this.contactService.findContacts(ctx);
  }

  @Mutation(() => ContactResponse)
  async addContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Contact", this.contactService.addContact(contact, ctx));
    return this.contactService.addContact(contact, ctx);
  }

  @Mutation(() => ContactResponse)
  async deleteContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Contact", this.contactService.deleteContact(contact, ctx));
    return this.contactService.deleteContact(contact, ctx);
  }
}
