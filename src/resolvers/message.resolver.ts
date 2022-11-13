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

import { MessageModel, MessageResponse, MessageInput } from "../models";
import { MessageService } from "../services";
import { IContext } from "../interfaces";

@Resolver(() => MessageModel)
export class ResolverMessage {
  constructor(private messageService: MessageService) {
    this.messageService = new MessageService();
  }

  @Subscription({
    topics: "Message",
  })
  messageSubscription(@Root() payload: MessageResponse): MessageResponse {
    return payload;
  }

  @Query(() => MessageResponse)
  async getMessages(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Message", this.messageService.findMessages(message, ctx));
    return this.messageService.findMessages(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async updateMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Message", this.messageService.updateMessage(message, ctx));
    return this.messageService.updateMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async addMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Message", this.messageService.addMessage(message, ctx));
    return this.messageService.addMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async deleteMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish("Message", this.messageService.deleteMessage(message, ctx));
    return this.messageService.deleteMessage(message, ctx);
  }
}
