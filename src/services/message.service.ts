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
    reply,
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
    try {
      if (text.length > 1000 || text.length < 1) {
        return invalid;
      }
      //search table
      const messageRepo = AppDataSource.getRepository(MessageModel);

      //create values
      const message = messageRepo.create({
        reply,
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
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      return findMessage?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //Delete chat to user
  private async findByIdAndDelete({
    id,
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
    try {
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
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      return findMessage?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  private async findByIdAndUpdate({
    id,
    text,
    chatId,
  }: MessageInput): Promise<MessageData[] | string> {
    try {
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

      //find values
      const findMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      return findMessage?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
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
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      return findMessage?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
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
          return { status: invalid, code: 404, message: "Can't add message" };
        }

        return { status: success, code: 201, data, message: "Message add" };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
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
          return { status: invalid, code: 404, message: "Message not delete" };
        }

        return { status: success, code: 200, data, message: "Message delete" };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
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

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Message not delete" };
        }

        return { status: success, code: 200, data };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
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
          return { status: invalid, code: 404, message: "Message not update" };
        }

        return {
          status: success,
          code: 200,
          data: message,
          message: "Message update",
        };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
}
