import * as dotenv from "dotenv";

import { invalid, success } from "../constants";
import { IContext } from "../interfaces";
import { MessageInput, MessageModel, MessageData } from "../models";
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
      .leftJoinAndSelect("message.reply", "reply")
      .getMany();

    if (!findMessage) {
      return invalid;
    }

    return findMessage?.sort(
      (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    ) as undefined as MessageData[];
  }

  //Delete chat to user
  private async findByIdAndDelete({
    id,
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
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
    //delete column
    await messageRepo
      .createQueryBuilder("message")
      .delete()
      .where("message.id = :id", { id })
      .execute();

    //find values
    const findMessage = await messageRepo
      .createQueryBuilder("message")
      .where("message.chatId = :chatId", { chatId })
      .leftJoinAndSelect("message.senderMessage", "senderMessage")
      .leftJoinAndSelect("message.chatId", "chatId")
      .leftJoinAndSelect("message.reply", "reply")
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
    chatId,
    reply,
  }: MessageInput): Promise<MessageData[] | string> {
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

    let update;

    if (text) {
      if (text.length > 1000 || text.length < 1) {
        return invalid;
      }
      update = text ? { ...update, text } : { ...update };
    }

    update = reply ? { ...update, reply } : { ...update };

    //update column
    await messageRepo
      .createQueryBuilder()
      .update(MessageModel)
      .set({ ...update })
      .where("message.id = :id", { id })
      .execute();

    //find values
    const findMessage = await messageRepo
      .createQueryBuilder("message")
      .where("message.chatId = :chatId", { chatId })
      .leftJoinAndSelect("message.senderMessage", "senderMessage")
      .leftJoinAndSelect("message.chatId", "chatId")
      .leftJoinAndSelect("message.reply", "reply")
      .getMany();

    if (!findMessage) {
      return invalid;
    }

    return findMessage?.sort(
      (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    ) as undefined as MessageData[];
  }

  //find message
  private async findMessage({
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
    try {
      //search table
      const messageRepo = AppDataSource.getRepository(MessageModel);
      //find values
      const findMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .addSelect("message.senderMessage", "senderMessage")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      return findMessage?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log("!!");
      console.log(e);
    }
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
    input: MessageInput,
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
    input: MessageInput,
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
    input: MessageInput,
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

        return { status: success, data: message, message: "Message update" };
      }

      return { status: invalid, message: "Invalid user" };
    } catch (error) {
      console.error(error);
    }
  }
}
