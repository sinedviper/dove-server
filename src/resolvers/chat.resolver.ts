import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { ChatResponse, ChatModel, ChatInput } from "../models";
import { ChatService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => ChatModel)
export class ResolverChat {
  constructor(private chatService: ChatService) {
    this.chatService = new ChatService();
  }

  @Query(() => ChatResponse)
  async getChats(@Arg("chat") chat: ChatInput, @Ctx() ctx: IContext) {
    return this.chatService.findChats(chat, ctx);
  }

  @Mutation(() => ChatResponse)
  async addChat(@Arg("chat") chat: ChatInput, @Ctx() ctx: IContext) {
    return this.chatService.addChat(chat, ctx);
  }

  @Mutation(() => ChatResponse)
  async deleteChat(@Arg("chat") chat: ChatInput, @Ctx() ctx: IContext) {
    return this.chatService.deleteChat(chat, ctx);
  }
}
