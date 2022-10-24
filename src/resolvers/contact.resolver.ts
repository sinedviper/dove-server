import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { ContactResponse, ContactModel, ContactInput } from "../models";
import { ContactService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => ContactModel)
export class ResolverContact {
  constructor(private contactService: ContactService) {
    this.contactService = new ContactService();
  }

  @Query(() => ContactResponse)
  async getContacts(@Ctx() ctx: IContext) {
    return this.contactService.findContacts(ctx);
  }

  @Mutation(() => ContactResponse)
  async addContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext
  ) {
    return this.contactService.addContact(contact, ctx);
  }

  @Mutation(() => ContactResponse)
  async deleteContact(
    @Arg("contact") contact: ContactInput,
    @Ctx() ctx: IContext
  ) {
    return this.contactService.deleteContact(contact, ctx);
  }
}
