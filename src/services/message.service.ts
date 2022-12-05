import * as dotenv from "dotenv";

import { invalid, success } from "../utils/constants";
import { IContext } from "../utils/interfaces";
import { AppDataSource } from "../utils/helpers";
import { MessageInput, MessageModel, MessageData } from "../models/Message";

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
        read: false,
        reply,
        senderMessage,
        text,
        chatId,
      });
      //save
      await messageRepo.save(message);

      return success;
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

      return success;
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
        .set({ text, dateUpdate: new Date() })
        .where("message.id = :id", { id })
        .execute();

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //find message
  private async findMessage(
    { chatId }: MessageInput,
    id: number
  ): Promise<MessageData[] | string> {
    try {
      //search table
      const messageRepo = AppDataSource.getRepository(MessageModel);
      //find values
      const findMessagess = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getOne();

      const dataFirst = findMessagess.createdAt;
      const dataSecond = new Date(
        dataFirst.getFullYear(),
        dataFirst.getMonth(),
        dataFirst.getDate(),
        0,
        0
      );
      //find values
      const findMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .andWhere("message.createdAt BETWEEN :dataSecond AND :dataFirst", {
          dataFirst: new Date(findMessagess.createdAt),
          dataSecond,
        })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      await Promise.all(
        findMessage.map(async (message: any) => {
          if (message.senderMessage?.id !== id)
            if (message.read === false)
              await messageRepo
                .createQueryBuilder()
                .update(MessageModel)
                .set({ read: true })
                .where("message.id = :id", { id: message.id })
                .execute();
        })
      );

      const findMessages = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .andWhere("message.createdAt BETWEEN :dataSecond AND :dataFirst", {
          dataFirst: new Date(
            findMessagess.createdAt.setTime(
              findMessagess.createdAt.getTime() + 1000
            )
          ),
          dataSecond,
        })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessages) {
        return invalid;
      }

      return findMessages?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //have message
  private async haveMessageData({
    chatId,
    id: messgaeId,
  }: MessageInput): Promise<string | Date> {
    try {
      //search table
      const messageRepo = AppDataSource.getRepository(MessageModel);

      const message = await messageRepo
        .createQueryBuilder("message")
        .where("message.id = :messgaeId", { messgaeId })
        .getOne();

      //find values
      const findMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .orderBy("message.createdAt", "DESC")
        .andWhere("message.createdAt < :data", { data: message.createdAt })
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getOne();

      if (findMessage === null) {
        return invalid;
      }

      return findMessage.createdAt;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //find message
  private async findMessageDate(
    { chatId, dataLastMessage }: MessageInput,
    id: number
  ): Promise<MessageData[] | string> {
    try {
      const dataSecond = new Date(
        dataLastMessage.getFullYear(),
        dataLastMessage.getMonth(),
        dataLastMessage.getDate(),
        0,
        0
      );

      //search table
      const messageRepo = AppDataSource.getRepository(MessageModel);

      //find values
      const findMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .andWhere("message.createdAt BETWEEN :dataSecond AND :dataFirst", {
          dataFirst: new Date(dataLastMessage),
          dataSecond,
        })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessage) {
        return invalid;
      }

      await Promise.all(
        findMessage.map(async (message: any) => {
          if (message.senderMessage?.id !== id)
            await messageRepo
              .createQueryBuilder()
              .update(MessageModel)
              .set({ read: true })
              .where("message.id = :id", { id: message.id })
              .execute();
        })
      );

      const findMessages = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId })
        .andWhere("message.createdAt BETWEEN :dataSecond AND :dataFirst", {
          dataFirst: new Date(dataLastMessage),
          dataSecond,
        })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.senderMessage", "senderMessage")
        .leftJoinAndSelect("message.chatId", "chatId")
        .leftJoinAndSelect("message.reply", "reply")
        .leftJoinAndSelect("reply.senderMessage", "senderMessage.id")
        .getMany();

      if (!findMessages) {
        return invalid;
      }

      return findMessages?.sort(
        (a: any, b: any) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ) as undefined as MessageData[];
    } catch (e) {
      console.log(e);
      return invalid;
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

      if (message == success) {
        //Add function message
        const add = await this.findByIdAndAdd(input);
        if (add == invalid) {
          return { status: invalid, code: 404, message: "Can't add message" };
        }

        const data = await this.findMessage(input, id);
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

      if (message == success) {
        //Delete fucntion message
        const remov = await this.findByIdAndDelete(input);

        if (remov == invalid) {
          return { status: invalid, code: 404, message: "Message not delete" };
        }

        const data = await this.findMessage(input, id);

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

  //Find message
  public async findMessages(
    input: MessageInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Add function message
        const data = await this.findMessage(input, id);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Message not find" };
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
      if (message == success) {
        //Update function message
        const message = await this.findByIdAndUpdate(input);

        if (message == invalid) {
          return { status: invalid, code: 404, message: "Message not update" };
        }

        const data = await this.findMessage(input, id);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Message not update" };
        }

        return {
          status: success,
          code: 200,
          data,
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

  //Find message
  public async haveMessage(
    input: MessageInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message } = await autorization(req, res);

      if (message == success) {
        //Add function message
        const data = await this.haveMessageData(input);

        if (data == invalid) {
          return { status: success, code: 200, data: null };
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

  //find date message
  public async findDateMessage(
    input: MessageInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == success) {
        //Update function message
        const message = await this.findMessageDate(input, id);

        if (message == invalid) {
          return { status: invalid, code: 404, message: "Message not have" };
        }

        return {
          status: success,
          code: 200,
          data: message,
          message: "Message have",
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
