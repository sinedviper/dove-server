import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { MessageResponse, MessageInput } from "../models/Message";
import { MessageService } from "../services";
import { IContext } from "../utils/interfaces";

@Resolver(() => MessageResponse)
export class ResolverMessage {
  constructor(private messageService: MessageService) {
    this.messageService = new MessageService();
  }

  @Query(() => MessageResponse)
  async getMessages(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
  ) {
    return await this.messageService.findMessages(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async updateMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
  ) {
    return await this.messageService.updateMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async addMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
  ) {
    return await this.messageService.addMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async deleteMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
  ) {
    return await this.messageService.deleteMessage(message, ctx);
  }
}
