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
  async getChats(@Ctx() ctx: IContext, @PubSub() pubsub: PubSubEngine) {
    pubsub.publish("Chat", this.chatService.findChats(ctx));
    return this.chatService.findChats(ctx);
  }

  @Mutation(() => ChatResponse)
  async addChat(
    @Arg("chat") chat: ChatInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Chat", this.chatService.addChat(chat, ctx));
    return this.chatService.addChat(chat, ctx);
  }

  @Mutation(() => ChatResponse)
  async deleteChat(
    @Arg("idChat") id: number,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Chat", this.chatService.deleteChat(id, ctx));
    return this.chatService.deleteChat(id, ctx);
  }
}
