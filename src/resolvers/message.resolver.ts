import {
  Arg,
  Ctx,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
} from "type-graphql";
import { PubSub as PubSubS, withFilter } from "graphql-subscriptions";

import { MessageResponse, MessageInput } from "../models";
import { MessageService } from "../services";
import { IContext } from "../interfaces";

const pubsub = new PubSubS();
@Resolver(() => MessageResponse)
export class ResolverMessage {
  constructor(private messageService: MessageService) {
    this.messageService = new MessageService();
  }

  // @Subscription({
  //   topics: "Message",
  //   // filter: ({ payload, args, context }: ResolverFilterData<any>) => {
  //   //   console.log(context);
  //   //   return payload.recipeId === args.recipeId;
  //   // },
  //   // subscribe: withFilter(
  //   //   () => pubsub.asyncIterator("Message"),
  //   //   (payload, variables) => {
  //   //     return payload.receiverMail === variables.receiverMail;
  //   //   }
  //   // ),
  //   // subscribe: withFilter(
  //   //   () => pubsub.asyncIterator("Message"),
  //   //   async (rootValue, args, context, info) => {
  //   //     return true;
  //   //   }
  //   // ),
  // })
  // messageSubscription(@Root() payload: MessageResponse): MessageResponse {
  //   return payload;
  // }

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
    //@PubSub() pubsub: PubSubEngine
  ) {
    // pubsub.publish(
    //   "Message",

    // );
    return await this.messageService.updateMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async addMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
    //@PubSub() pubsub: PubSubEngine
  ) {
    // pubsub.publish(
    //   "Message",

    // );
    return await this.messageService.addMessage(message, ctx);
  }

  @Mutation(() => MessageResponse)
  async deleteMessage(
    @Arg("message") message: MessageInput,
    @Ctx() ctx: IContext
    //@PubSub() pubsub: PubSubEngine
  ) {
    // pubsub.publish(
    //   "Message",

    // );
    return await this.messageService.deleteMessage(message, ctx);
  }
}
