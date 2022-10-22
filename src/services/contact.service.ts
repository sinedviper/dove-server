import * as dotenv from "dotenv";

import { IContext } from "../interfaces";
import { ContactInput, ContactModel, UserData } from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class ContactService {
  //Add contact to user
  private async findByIdAndAdd(
    userId: number,
    contactId: number
  ): Promise<string> {
    const contactRepo = AppDataSource.getRepository(ContactModel);
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .andWhere("contact.contactId = :contactId", { contactId })
      .getOne();

    if (findContact) {
      return "invalid";
    }

    const contact = contactRepo.create({
      userId,
      contactId,
    });
    await contactRepo.save(contact);

    return "success";
  }

  //Delete contact to user
  private async findByIdAndDelete(
    userId: number,
    contactId: number
  ): Promise<string> {
    const contactRepo = AppDataSource.getRepository(ContactModel);
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .andWhere("contact.contactId = :contactId", { contactId })
      .getOne();

    if (!findContact) {
      return "invalid";
    }

    await contactRepo
      .createQueryBuilder("contact")
      .delete()
      .where("contact.userId = :userId", { userId })
      .andWhere("contact.contactId = :contactId", { contactId })
      .execute();

    return "success";
  }

  //find contact User
  private async findContactUser(userId: number): Promise<UserData[] | string> {
    const contactRepo = AppDataSource.getRepository(ContactModel);
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .leftJoinAndSelect("contact.contactId", "contactId")
      .getMany();

    if (!findContact) {
      return "invalid";
    }

    return findContact.map((obj) => {
      return obj.contactId as unknown as UserData;
    }) as UserData[];
  }

  //Add contact
  public async addContact(
    input: ContactInput,
    { req, res, deserializeUser }: IContext
  ) {
    try {
      const { message } = await deserializeUser(req, res);

      if (message == "success") {
        //Add contact
        const mess = await this.findByIdAndAdd(input.userId, input.contactId);
        if (mess == "invalid") {
          return { status: "invalid", message: "Can't add" };
        }

        return { status: "success", message: "Contact add" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Delete Contact
  public async deleteContact(
    input: ContactInput,
    { req, res, deserializeUser }: IContext
  ) {
    try {
      const { message } = await deserializeUser(req, res);

      if (message == "success") {
        //Add contact
        const mess = await this.findByIdAndDelete(
          input.userId,
          input.contactId
        );
        if (mess == "invalid") {
          return { status: "invalid", message: "Can't delete" };
        }

        return { status: "success", message: "Contact delete" };
      }

      return { status: "invalid", message };
    } catch (error) {
      console.error(error);
    }
  }

  //Find Contacts
  public async findContacts(
    input: ContactInput,
    { req, res, deserializeUser }: IContext
  ) {
    try {
      const { message } = await deserializeUser(req, res);

      if (message == "success") {
        //Add contact
        const data = await this.findContactUser(input.userId);
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
