import * as dotenv from "dotenv";

import { invalid, success } from "../constants";
import { IContext } from "../interfaces";
import { ContactInput, ContactModel, UserData } from "../models";
import { AppDataSource } from "../utils";

dotenv.config();

export class ContactService {
  //Add contact to user
  private async findByIdAndAdd({
    userId,
    contactId,
  }: ContactInput): Promise<UserData[] | string> {
    try {
      //search table
      const contactRepo = AppDataSource.getRepository(ContactModel);
      //find values
      const findContact = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .andWhere("contact.contactId = :contactId", { contactId })
        .getOne();

      if (findContact) {
        return invalid;
      }
      //create contact
      const contact = contactRepo.create({
        userId,
        contactId,
      });
      await contactRepo.save(contact);

      const findContacts = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .leftJoinAndSelect("contact.contactId", "contactId")
        .getMany();

      if (!findContacts) {
        return invalid;
      }
      //give contacts
      return findContacts.map((obj) => {
        return obj.contactId as unknown as UserData;
      }) as UserData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //Delete contact to user
  private async findByIdAndDelete({
    userId,
    contactId,
  }: ContactInput): Promise<UserData[] | string> {
    try {
      //search table
      const contactRepo = AppDataSource.getRepository(ContactModel);
      //find values
      const findContact = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .andWhere("contact.contactId = :contactId", { contactId })
        .getOne();

      if (!findContact) {
        return invalid;
      }
      //delete contact
      await contactRepo
        .createQueryBuilder("contact")
        .delete()
        .where("contact.userId = :userId", { userId })
        .andWhere("contact.contactId = :contactId", { contactId })
        .execute();

      const findContacts = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .leftJoinAndSelect("contact.contactId", "contactId")
        .getMany();

      if (!findContacts) {
        return invalid;
      }
      //give contacts
      return findContacts.map((obj) => {
        return obj.contactId as unknown as UserData;
      }) as UserData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //find contact User
  private async findContactUser(userId: number): Promise<UserData[] | string> {
    try {
      //search table
      const contactRepo = AppDataSource.getRepository(ContactModel);
      //find values
      const findContact = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .leftJoinAndSelect("contact.contactId", "contactId")
        .getMany();

      if (!findContact) {
        return invalid;
      }
      //give contacts
      return findContact.map((obj) => {
        return obj.contactId as unknown as UserData;
      }) as UserData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //-----------------------------------------------------------Public function-------------------------------------------------
  //Add contact
  public async addContact(
    input: ContactInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.userId) {
        //Add function contact
        const data = await this.findByIdAndAdd(input);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Can't add" };
        }

        return {
          status: success,
          code: 201,
          data,
          message: "Contact add",
        };
      }

      return { status: invalid, code: 401, message };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Delete Contact
  public async deleteContact(
    input: ContactInput,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success && id == input.userId) {
        //Delete fucntion contact
        const data = await this.findByIdAndDelete(input);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Can't delete" };
        }

        return {
          status: success,
          code: 200,
          data,
          message: "Contact delete",
        };
      }

      return { status: invalid, code: 401, message };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }

  //Find Contacts
  public async findContacts({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Find function contact
        const data = await this.findContactUser(id);
        if (data == invalid) {
          return { status: invalid, code: 404, message: "Can't find" };
        }

        return { status: success, code: 200, data };
      }

      return { status: invalid, code: 401, message };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
}
