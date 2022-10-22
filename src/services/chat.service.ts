import * as dotenv from "dotenv";

import { IContext } from "../interfaces";
import { ChatInput, UserData, ChatModel } from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class ChatService {
  //Add chat to user
  private async findByIdAndAdd(input: ChatInput): Promise<string> {
    const chatRepo = AppDataSource.getRepository(ChatModel);
    let findChat = await chatRepo
      .createQueryBuilder("chat")
      .where("chat.sender = :sender", { sender: input.sender })
      .andWhere("chat.recipient = :recipient", { recipient: input.recipient })
      .getOne();

    if (findChat) {
      return "invalid";
    } else {
      if (!findChat) {
        findChat = await chatRepo
          .createQueryBuilder("chat")
          .where("chat.sender = :sender", { sender: input.recipient })
          .andWhere("chat.recipient = :recipient", {
            recipient: input.sender,
          })
          .getOne();

        if (findChat) {
          return "invalid";
        }
      }
    }

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
  private async findByIdAndDelete(input: ChatInput): Promise<string> {
    const chatRepo = AppDataSource.getRepository(ChatModel);
    let findChat = await chatRepo
      .createQueryBuilder("chat")
      .where("chat.sender = :sender", { sender: input.sender })
      .andWhere("chat.recipient = :recipient", { recipient: input.recipient })
      .getOne();

    if (!findChat) {
      return "invalid";
    } else {
      if (findChat) {
        findChat = await chatRepo
          .createQueryBuilder("chat")
          .where("chat.sender = :sender", { sender: input.recipient })
          .andWhere("chat.recipient = :recipient", {
            recipient: input.sender,
          })
          .getOne();

        if (findChat) {
          return "invalid";
        }
      }
    }

    await chatRepo
      .createQueryBuilder("chat")
      .delete()
      .where("chat.sender = :sender", { sender: input.sender })
      .andWhere("chat.recipient = :recipient", { recipient: input.recipient })
      .execute();

    return "success";
  }

  //find chat User
  private async findChatUser(sender: number): Promise<UserData[] | string> {
    const contactRepo = AppDataSource.getRepository(ChatModel);
    const findContact = await contactRepo
      .createQueryBuilder("chat")
      .where("chat.sender = :sender", { sender })
      .leftJoinAndSelect("chat.recipient", "recipient")
      .getMany();

    if (!findContact) {
      return "invalid";
    }
    console.log(findContact);
    return findContact.map((obj) => {
      return obj.recipient as unknown as UserData;
    }) as UserData[];
  }

  //Add chat
  public async addChat(input: ChatInput, { req, res, autorization }: IContext) {
    try {
      const { message } = await autorization(req, res);

      if (message == "success") {
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
  public async deleteChat(
    input: ChatInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message } = await autorization(req, res);

      if (message == "success") {
        //Delete fucntion chat
        const mess = await this.findByIdAndDelete(input);
        if (mess == "invalid") {
          return { status: "invalid", message: "Can't delete" };
        }

        return { status: "success", message: "Chat delete" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Find chats
  public async findChats(
    input: ChatInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message } = await autorization(req, res);

      if (message == "success") {
        //Add chat
        const data = await this.findChatUser(input.sender);
        if (data == "invalid") {
          return { status: "invalid", message: "Can't find" };
        }

        return { status: "success", data };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }
}
