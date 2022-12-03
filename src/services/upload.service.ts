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

      return success;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }

  //Delete contact to user
  private async DeleteUploadFile(
    fileId: number
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

      return success;
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

  //find upload User
  private async findUploadUser(
    userUploadId: number
  ): Promise<UploadData | string> {
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
      )[0] as unknown as UploadData;
    } catch (e) {
      console.log(e);
      return invalid;
    }
  }
  //-----------------------------------------------------------Public function-------------------------------------------------
  //Add upload
  public async addFile(file: string, { req, res, autorization }: IContext) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Add function contact
        const add = await this.AddUploadFile(file, id);

        if (add == invalid) {
          return { status: invalid, code: 404, message: "Can't add" };
        }

        const data = await this.findUpload(id);
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

  //Delete upload
  public async deleteFile(
    fileId: number,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message, id } = await autorization(req, res);

      if (message == success) {
        //Delete fucntion contact
        const rem = await this.DeleteUploadFile(fileId);

        if (rem == invalid) {
          return { status: invalid, code: 404, message: "Can't delete" };
        }

        const data = await this.findUpload(id);
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

  //Find UploadUser
  public async findUploadsUser(
    id: number,
    { req, res, autorization }: IContext
  ) {
    try {
      const { message } = await autorization(req, res);

      if (message == success) {
        //Find function contact
        const data = await this.findUploadUser(id);

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
