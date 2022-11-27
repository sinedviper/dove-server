import * as dotenv from "dotenv";

import { invalid, success } from "../utils/constants";
import { IContext } from "../utils/interfaces";
import { AppDataSource } from "../utils/helpers";
import { ChatInput, ChatModel, Chats } from "../models/Chat";
import { UploadModel } from "../models/Upload";
import { MessageModel } from "../models/Message";
import { UserData } from "../models/User";

dotenv.config();

export class ChatService {
  //Add chat to user
  private async findByIdAndAdd(input: ChatInput): Promise<string> {
    try {
      //Connect table
      const chatRepo = AppDataSource.getRepository(ChatModel);
      //search in table
      let findChat = await chatRepo
        .createQueryBuilder("chat")
        .where("chat.sender = :sender", { sender: input.sender })
        .andWhere("chat.recipient = :recipient", { recipient: input.recipient })
        .getOne();

      //check value on boolean
      if (findChat) {
        if (findChat.senderChat == true) {
          await chatRepo
            .createQueryBuilder()
            .update(ChatModel)
            .set({ senderChat: false })
            .where("chat.sender = :sender", { sender: input.sender })
            .andWhere("chat.recipient = :recipient", {
              recipient: input.recipient,
            })
            .execute();
          return success;
        }

        return success;
      } else if (!findChat) {
        findChat = await chatRepo
          .createQueryBuilder("chat")
          .where("chat.sender = :sender", { sender: input.recipient })
          .andWhere("chat.recipient = :recipient", {
            recipient: input.sender,
          })
          .getOne();

        if (findChat) {
          if (findChat.recipientChat == true) {
            await chatRepo
              .createQueryBuilder()
              .update(ChatModel)
              .set({ recipientChat: false })
              .where("chat.sender = :sender", { sender: input.recipient })
              .andWhere("chat.recipient = :recipient", {
                recipient: input.sender,
              })
              .execute();
            return success;
          }
          return success;
        }
      }
      //create chat
      const chat = chatRepo.create({
        sender: Number(input.sender),
        recipient: Number(input.recipient),
        senderChat: false,
        recipientChat: false,
      });
      await chatRepo.save(chat);

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //Delete chat to user
  private async findByIdAndDelete(id: number, userId: number): Promise<string> {
    try {
      //connect table
      const chatRepo = AppDataSource.getRepository(ChatModel);
      //search in table
      let user = await chatRepo
        .createQueryBuilder("chat")
        .where("chat.id = :id", { id: Number(id) })
        .leftJoinAndSelect("chat.sender", "sender")
        .leftJoinAndSelect("chat.recipient", "recipient")
        .getOne();

      if (!user) {
        return invalid;
      }

      const userSender: UserData = user.sender as unknown as UserData;
      const userResepient: UserData = user.recipient as unknown as UserData;
      //check user boolean who delete chat
      if (userSender.id == userId) {
        if (user.senderChat == false && user.recipientChat == false) {
          await chatRepo
            .createQueryBuilder()
            .update(ChatModel)
            .set({ senderChat: true })
            .where("chat.id = :id", { id })
            .execute();
        } else if (user.senderChat == false && user.recipientChat == true) {
          await chatRepo
            .createQueryBuilder("chat")
            .delete()
            .where("chat.id = :id", { id })
            .execute();
        }
      } else if (userResepient.id == userId) {
        if (user.recipientChat == false && user.senderChat == false) {
          await chatRepo
            .createQueryBuilder()
            .update(ChatModel)
            .set({ recipientChat: true })
            .where("chat.id = :id", { id })
            .execute();
        } else if (user.recipientChat == false && user.senderChat == true) {
          await chatRepo
            .createQueryBuilder("chat")
            .delete()
            .where("chat.id = :id", { id })
            .execute();
        }
      }

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //find chat User
  private async findChatUser(sender: number): Promise<Chats[] | string> {
    try {
      //search table
      const chatRepo = AppDataSource.getRepository(ChatModel);
      const messageRepo = AppDataSource.getRepository(MessageModel);
      const uploadRepo = AppDataSource.getRepository(UploadModel);
      //take table
      const findChatSender = await chatRepo
        .createQueryBuilder("chat")
        .where("chat.sender = :sender", { sender })
        .andWhere("chat.senderChat = :chat", { chat: false })
        .leftJoinAndSelect("chat.recipient", "recipient")
        .getMany();

      const chatSender = await Promise.all(
        findChatSender.map(async (obj: any) => {
          const findMessage = await messageRepo
            .createQueryBuilder("message")
            .where("message.chatId = :chatId", { chatId: obj.id })
            .leftJoinAndSelect("message.senderMessage", "senderMessage")
            .leftJoinAndSelect("message.chatId", "chatId")
            .getMany();

          const findRepo = await uploadRepo
            .createQueryBuilder("upload")
            .where("upload.userUploadId = :userUploadId", {
              userUploadId: obj.recipient.id,
            })
            .getMany();

          return {
            ...obj,
            lastMessage: findMessage.sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )[0],
            image: findRepo.sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )[0],
          };
        })
      );

      //take table
      const findChatReceipt = await chatRepo
        .createQueryBuilder("chat")
        .where("chat.recipient = :sender", { sender })
        .andWhere("chat.recipientChat = :chat", { chat: false })
        .leftJoinAndSelect("chat.sender", "sender")
        .getMany();

      const chatReceipt = await Promise.all(
        findChatReceipt.map(async (obj: any) => {
          const findMessage = await messageRepo
            .createQueryBuilder("message")
            .where("message.chatId = :chatId", { chatId: obj.id })
            .leftJoinAndSelect("message.senderMessage", "senderMessage")
            .leftJoinAndSelect("message.chatId", "chatId")
            .getMany();

          const findRepo = await uploadRepo
            .createQueryBuilder("upload")
            .where("upload.userUploadId = :userUploadId", {
              userUploadId: obj.sender.id,
            })
            .getMany();

          return {
            ...obj,
            lastMessage: findMessage.sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )[0],
            image: findRepo.sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )[0],
          };
        })
      );

      //optimization chats
      const rec = chatReceipt.map((obj) => ({
        id: obj.id,
        user: obj.sender,
        lastMessage: obj.lastMessage,
        image: obj.image,
      }));

      const sen = chatSender.map((obj) => ({
        id: obj.id,
        user: obj.recipient,
        lastMessage: obj.lastMessage,
        image: obj.image,
      }));

      return [...sen, ...rec] as unknown as Chats[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //-------------------------------------------------------------Public function----------------------------------------------
  //Add chat
  public async addChat(input: ChatInput, { req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.sender) {
        //Add function chat
        const data = await this.findByIdAndAdd(input);
        if (data == invalid) {
          return { status: invalid, code: 404, message: "Can't add" };
        }
        const chats = await this.findChatUser(id);
        if (chats === invalid) {
          return { status: invalid, code: 404, message: "Chat no search" };
        }

        return { status: success, code: 201, data: chats };
      }

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Delete chat
  public async deleteChat(id: number, { req, res, autorization }: IContext) {
    try {
      const { message, id: userId } = await autorization(req, res);

      if (message == success) {
        //Delete fucntion chat
        const data = await this.findByIdAndDelete(id, userId);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Chat not delete" };
        }

        //Find chats
        const chats = await this.findChatUser(userId);
        if (chats === invalid) {
          return { status: invalid, code: 404, message: "Chat no search" };
        }

        return { status: success, code: 200, data: chats };
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
  public async findChats({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);
      if (message == success) {
        //Add chat
        const data = await this.findChatUser(id);
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
}
