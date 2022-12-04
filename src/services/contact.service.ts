import * as dotenv from "dotenv";

import { invalid, success } from "../utils/constants";
import { IContext } from "../utils/interfaces";
import { AppDataSource } from "../utils/helpers";
import { UploadModel } from "../models/Upload";
import { ContactInput, ContactModel } from "../models/Contact";
import { UserData } from "../models/User";

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

      return success;
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

      return success;
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

      const uploadRepo = AppDataSource.getRepository(UploadModel);

      let upload = await Promise.all(
        findContact.map(async (contact: any) => {
          let img = await uploadRepo
            .createQueryBuilder("upload")
            .where("upload.userUploadId = :id", { id: contact.contactId.id })
            .getMany();

          const image = img.sort(
            (a: any, b: any) =>
              Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )[0];

          if (image) contact.contactId.file = image.file;

          return contact;
        })
      );

      //give contacts
      return upload.map((obj: any) => {
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

      if (message == success) {
        //Add function contact
        const add = await this.findByIdAndAdd(input);

        if (add == invalid) {
          return { status: invalid, code: 404, message: "Can't add" };
        }

        const data = await this.findContactUser(id);

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

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
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

      if (message == success) {
        //Delete fucntion contact
        const rem = await this.findByIdAndDelete(input);

        if (rem == invalid) {
          return { status: invalid, code: 404, message: "Can't delete" };
        }

        const data = await this.findContactUser(id);
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

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
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

      if (message == invalid) {
        return { status: invalid, code: 401, message: "Unauthorized" };
      }

      return { status: success, code: 406, message: "Not Acceptable" };
    } catch (e) {
      return { status: invalid, code: 500, message: e.message };
    }
  }
}
