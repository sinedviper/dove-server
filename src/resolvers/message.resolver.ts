import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  MessageModel,
  MessageResponse,
  MessageInput,
  MessageUpdateInput,
  MessageFindInput,
  MessageDeleteInput,
} from "../models";
import { MessageService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => MessageModel)
export class ResolverMessage {
  constructor(private messageService: MessageService) {
    this.messageService = new MessageService();
  }

  @Query(() => MessageResponse)
  async getMessages(
    @Arg("message") message: MessageFindInput,
    @Ctx() ctx: IContext
  ) {
    return this.messageService.findMessages(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async updateMessage(
    @Arg("message") message: MessageUpdateInput,
    @Ctx() ctx: IContext
  ) {
    return this.messageService.updateMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async addMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
  ) {
    return this.messageService.addMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async deleteMessage(
    @Arg("message") input: MessageDeleteInput,
    @Ctx() ctx: IContext
  ) {
    return this.messageService.deleteMessage(input, ctx);
  }
}
