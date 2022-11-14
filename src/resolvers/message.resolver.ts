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

  @Query(() => Boolean)
  async getMessages(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Message",
      await this.messageService.findMessages(message, ctx)
    );
    return true;
  }

  @Mutation(() => Boolean)
  async updateMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Message",
      await this.messageService.updateMessage(message, ctx)
    );
    return true;
  }

  @Mutation(() => Boolean)
  async addMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Message",
      await this.messageService.addMessage(message, ctx)
    );
    return true;
  }

  @Mutation(() => Boolean)
  async deleteMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext,
    @PubSub() pubsub: PubSubEngine
  ) {
    pubsub.publish(
      "Message",
      await this.messageService.deleteMessage(message, ctx)
    );
    return true;
  }
}
