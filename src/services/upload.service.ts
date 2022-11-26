import { UploadModel } from "./../models/Upload/upload.model";
import * as dotenv from "dotenv";

import { invalid, success } from "../utils/constants";
import { IContext } from "../utils/interfaces";
import { AppDataSource } from "../utils/helpers";
import { UploadData } from "../models/Upload";

dotenv.config();

export class UploadService {
  //Add contact to user
  private async AddUploadFile(
    file: string,
    userUploadId: number
  ): Promise<UploadModel[] | string> {
    try {
      //search table
      const uploadRepo = AppDataSource.getRepository(UploadModel);

      //create contact
      const upload = uploadRepo.create({
        file,
        userUploadId,
      });
      await uploadRepo.save(upload);

      const findUploads = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.userUploadId = :userUploadId", { userUploadId })
        .getMany();

      if (!findUploads) {
        return invalid;
      }
      //give contacts
      return findUploads.sort(
        (a: any, b: any) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      ) as unknown as UploadModel[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //Delete contact to user
  private async DeleteUploadFile(
    fileId: number,
    userUploadId: number
  ): Promise<UploadData[] | string> {
    try {
      //search table
      const uploadRepo = AppDataSource.getRepository(UploadModel);
      //find values
      const findContact = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.id = :fileId", { fileId })
        .getOne();

      if (!findContact) {
        return invalid;
      }
      //delete contact
      await uploadRepo
        .createQueryBuilder("upload")
        .delete()
        .where("upload.id = :fileId", { fileId })
        .execute();

      const findUploads = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.userUploadId = :userUploadId", { userUploadId })
        .getMany();

      if (!findUploads) {
        return invalid;
      }

      //give upload
      return findUploads.sort(
        (a: any, b: any) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      ) as unknown as UploadData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //find contact User
  private async findUpload(
    userUploadId: number
  ): Promise<UploadData[] | string> {
    try {
      //search table
      const uploadRepo = AppDataSource.getRepository(UploadModel);
      //find values
      const findUpload = await uploadRepo
        .createQueryBuilder("upload")
        .where("upload.userUploadId = :userUploadId", { userUploadId })
        .getMany();

      if (!findUpload) {
        return invalid;
      }

      //give upload
      return findUpload.sort(
        (a: any, b: any) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      ) as unknown as UploadData[];
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //-----------------------------------------------------------Public function-------------------------------------------------
  //Add contact
  public async addFile(file: string, { req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Add function contact
        const data = await this.AddUploadFile(file, id);

        if (data == invalid) {
          return { status: invalid, code: 404, message: "Can't add" };
        }

        return {
          status: success,
          code: 201,
          data,
          message: "File add",
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
  public async deleteFile(
    fileId: number,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Delete fucntion contact
        const data = await this.DeleteUploadFile(fileId, id);

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
  public async findFiles({ req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Find function contact
        const data = await this.findUpload(id);

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
