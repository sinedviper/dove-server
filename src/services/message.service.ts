import * as dotenv from "dotenv";

import { invalid, success } from "../constants";
import { IContext } from "../interfaces";
import {
  MessageInput,
  MessageModel,
  MessageData,
  MessageFindInput,
  MessageUpdateInput,
  MessageDeleteInput,
} from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class MessageService {
  //Add chat to user
  private async findByIdAndAdd({
    senderMessage,
    text,
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
    if (text.length > 1000 || text.length < 1) {
      return invalid;
    }
    //search table
    const messageRepo = AppDataSource.getRepository(MessageModel);
    //create values
    const message = messageRepo.create({
      senderMessage,
      text,
      chatId,
    });
    //save
    await messageRepo.save(message);

    const findMessage = await messageRepo
      .createQueryBuilder("message")
      .where("message.chatId = :chatId", { chatId })
      .leftJoinAndSelect("message.senderMessage", "senderMessage")
      .leftJoinAndSelect("message.chatId", "chatId")
      .getMany();

    if (!findMessage) {
      return invalid;
    }

    return findMessage?.sort(
      (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    ) as undefined as MessageData[];
  }

  //Delete chat to user
  private async findByIdAndDelete(
    input: MessageDeleteInput
  ): Promise<MessageData[] | string> {
    //search table
    const messageRepo = AppDataSource.getRepository(MessageModel);
    //find values
    let message = await messageRepo
      .createQueryBuilder("message")
      .where("message.id = :id", { id: input.id })
      .getOne();

    if (!message) {
      return invalid;
    }
    //delete column
    await messageRepo
      .createQueryBuilder("message")
      .delete()
      .where("message.id = :id", { id: input.id })
      .execute();

    //find values
    const findMessage = await messageRepo
      .createQueryBuilder("message")
      .where("message.chatId = :chatId", { chatId: input.chatId })
      .leftJoinAndSelect("message.senderMessage", "senderMessage")
      .leftJoinAndSelect("message.chatId", "chatId")
      .getMany();

    if (!findMessage) {
      return invalid;
    }

    return findMessage?.sort(
      (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    ) as undefined as MessageData[];
  }

  private async findByIdAndUpdate({
    id,
    text,
  }: MessageUpdateInput): Promise<string> {
    //search table
    const messageRepo = AppDataSource.getRepository(MessageModel);
    //find values
    let message = await messageRepo
      .createQueryBuilder("message")
      .where("message.id = :id", { id })
      .getOne();

    if (!message) {
      return invalid;
    }
    if (text.length > 1000 || text.length < 1) {
      return invalid;
    }
    //update column
    await messageRepo
      .createQueryBuilder()
      .update(MessageModel)
      .set({ text })
      .where("message.id = :id", { id })
      .execute();

    return success;
  }

  //find message
  private async findMessage({
    chatId,
  }: MessageFindInput): Promise<MessageData[] | string> {
    //search table
    const messageRepo = AppDataSource.getRepository(MessageModel);
    //find values
    const findMessage = await messageRepo
      .createQueryBuilder("message")
      .where("message.chatId = :chatId", { chatId })
      .leftJoinAndSelect("message.senderMessage", "senderMessage")
      .leftJoinAndSelect("message.chatId", "chatId")
      .getMany();

    if (!findMessage) {
      return invalid;
    }

    return findMessage?.sort(
      (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    ) as undefined as MessageData[];
  }
  //-------------------------------------------------Public function------------------------------------------------------------
  //Add message
  public async addMessage(
    input: MessageInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.senderMessage) {
        //Add function message
        const data = await this.findByIdAndAdd(input);
        if (data == invalid) {
          return { status: invalid, message: "Can't add message" };
        }

        return { status: success, data, message: "Message add" };
      }

      return { status: invalid, message: "Invalid user" };
    } catch (error) {
      console.error(error);
    }
  }

  //Delete message
  public async deleteMessage(
    input: MessageDeleteInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.senderMessage) {
        //Delete fucntion message
        const data = await this.findByIdAndDelete(input);
        if (data == invalid) {
          return { status: invalid, message: "Message not delete" };
        }
        return { status: success, data, message: "Message delete" };
      }

      return { status: invalid, message: "Invalid user" };
    } catch (error) {
      console.error(error);
    }
  }

  //Find chats
  public async findMessages(
    input: MessageFindInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.senderMessage) {
        //Add function message
        const data = await this.findMessage(input);
        return { status: success, data };
      }

      return { status: invalid, message: "Invalid user" };
    } catch (error) {
      console.error(error);
    }
  }
  //Update message
  public async updateMessage(
    input: MessageUpdateInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == success && id == input.senderMessage) {
        //Update function message
        const message = await this.findByIdAndUpdate(input);
        if (message == invalid) {
          return { status: invalid, message: "Message not update" };
        }
        return { status: success, message: "Message update" };
      }

      return { status: invalid, message: "Invalid user" };
    } catch (error) {
      console.error(error);
    }
  }
}
