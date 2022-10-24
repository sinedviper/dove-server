import * as dotenv from "dotenv";

import { IContext } from "../interfaces";
import { ChatInput, UserData, ChatModel } from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class ChatService {
  //Add chat to user
  private async findByIdAndAdd(input: ChatInput): Promise<string> {
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
          .set({ senderChat: true })
          .where("chat.sender = :sender", { sender: input.sender })
          .andWhere("chat.recipient = :recipient", {
            recipient: input.recipient,
          })
          .execute();
        return "success";
      }
      return "invalid";
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
            .set({ recipientChat: true })
            .where("chat.sender = :sender", { sender: input.recipient })
            .andWhere("chat.recipient = :recipient", {
              recipient: input.sender,
            })
            .execute();
          return "success";
        }
        return "invalid";
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

    return "success";
  }

  //Delete chat to user
  private async findByIdAndDelete(id: number, userId: number): Promise<string> {
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
      return "invalid";
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

    return "success";
  }

  //find chat User
  private async findChatUser(sender: number): Promise<UserData[] | string> {
    //search table
    const chatRepo = AppDataSource.getRepository(ChatModel);
    //take table
    const findChatSender = await chatRepo
      .createQueryBuilder("chat")
      .where("chat.sender = :sender", { sender })
      .andWhere("chat.senderChat = :chat", { chat: false })
      .leftJoinAndSelect("chat.recipient", "recipient")
      .getMany();
    //take table
    const findChatReceipt = await chatRepo
      .createQueryBuilder("chat")
      .where("chat.recipient = :sender", { sender })
      .andWhere("chat.recipientChat = :chat", { chat: false })
      .leftJoinAndSelect("chat.sender", "sender")
      .getMany();
    //optimization chats
    const rec = findChatReceipt.map((obj) => {
      return obj.sender as unknown as UserData;
    }) as UserData[];

    const sen = findChatSender.map((obj) => {
      return obj.recipient as unknown as UserData;
    }) as UserData[];

    return [...sen, ...rec];
  }
  //-------------------------------------------------------------Public function----------------------------------------------
  //Add chat
  public async addChat(input: ChatInput, { req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success" && id == input.sender) {
        //Add function chat
        const data = await this.findByIdAndAdd(input);
        if (data == "invalid") {
          return { status: "invalid", message: "Can't add" };
        }

        return { status: "success", message: "Chat add" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Delete chat
  public async deleteChat(id: number, { req, res, autorization }: IContext) {
    try {
      const { message, id: userId } = await autorization(req, res);

      if (message == "success") {
        //Delete fucntion chat
        const data = await this.findByIdAndDelete(id, userId);
        if (data == "invalid") {
          return { status: "invalid", message: "Chat not delete" };
        }
        return { status: "success", message: "Chat delete" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Find chats
  public async findChats({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success") {
        //Add chat
        const data = await this.findChatUser(id);
        return { status: "success", data };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }
}
