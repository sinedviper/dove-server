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

import { ChatResponse, ChatModel, ChatInput } from "../models";
import { ChatService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => ChatModel)
export class ResolverChat {
  constructor(private chatService: ChatService) {
    this.chatService = new ChatService();
  }

  @Subscription({
    topics: "Chat",
  })
  chatSubscription(@Root() payload: ChatResponse): ChatResponse {
    return payload;
  }

  @Query(() => ChatResponse)
  async getChats(@Ctx() ctx: IContext) {
    return this.chatService.findChats(ctx);
  }

  @Mutation(() => Boolean)
  async addChat(
    @Arg("chat") chat: ChatInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Chat", await this.chatService.addChat(chat, ctx));
    return true;
  }

  @Mutation(() => Boolean)
  async deleteChat(
    @Arg("idChat") id: number,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Chat", await this.chatService.deleteChat(id, ctx));
    return true;
  }
}
