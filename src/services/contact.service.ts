import * as dotenv from "dotenv";

import { IContext } from "../interfaces";
import { ContactInput, ContactModel, UserData } from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class ContactService {
  //Add contact to user
  private async findByIdAndAdd({
    userId,
    contactId,
  }: ContactInput): Promise<string> {
    //search table
    const contactRepo = AppDataSource.getRepository(ContactModel);
    //find values
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .andWhere("contact.contactId = :contactId", { contactId })
      .getOne();

    if (findContact) {
      return "invalid";
    }
    //create contact
    const contact = contactRepo.create({
      userId,
      contactId,
    });
    await contactRepo.save(contact);

    return "success";
  }

  //Delete contact to user
  private async findByIdAndDelete({
    userId,
    contactId,
  }: ContactInput): Promise<string> {
    //search table
    const contactRepo = AppDataSource.getRepository(ContactModel);
    //find values
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .andWhere("contact.contactId = :contactId", { contactId })
      .getOne();

    if (!findContact) {
      return "invalid";
    }
    //delete contact
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
    //search table
    const contactRepo = AppDataSource.getRepository(ContactModel);
    //find values
    const findContact = await contactRepo
      .createQueryBuilder("contact")
      .where("contact.userId = :userId", { userId })
      .leftJoinAndSelect("contact.contactId", "contactId")
      .getMany();

    if (!findContact) {
      return "invalid";
    }
    //give contacts
    return findContact.map((obj) => {
      return obj.contactId as unknown as UserData;
    }) as UserData[];
  }
  //-----------------------------------------------------------Public function-------------------------------------------------
  //Add contact
  public async addContact(
    input: ContactInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success" && id == input.userId) {
        //Add function contact
        const mess = await this.findByIdAndAdd(input);
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
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success" && id == input.userId) {
        //Delete fucntion contact
        const mess = await this.findByIdAndDelete(input);
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
  public async findContacts({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == "success") {
        //Find function contact
        const data = await this.findContactUser(id);
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
