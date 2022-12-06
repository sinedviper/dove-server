import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import fs from "fs";

import { UploadResponse, UploadResponseUser } from "../models/Upload";
import { IContext } from "../utils/interfaces";
import { UploadService } from "../services";
import { dirname } from "../index";

@Resolver(() => UploadResponse)
export class ResolverUpload {
  constructor(private uploadService: UploadService) {
    this.uploadService = new UploadService();
  }

  @Query(() => UploadResponse)
  async getUpload(@Ctx() ctx: IContext) {
    return await this.uploadService.findFiles(ctx);
  }

  @Query(() => UploadResponseUser)
  async getUploadUser(@Arg("idUser") idUser: number, @Ctx() ctx: IContext) {
    return await this.uploadService.findUploadsUser(idUser, ctx);
  }

  @Mutation(() => UploadResponse)
  async deleteUpload(
    @Arg("file") file: string,
    @Arg("idPhoto") idPhoto: number,
    @Ctx() ctx: IContext
  ) {
    const filePath = dirname + "/images/" + file;
    fs.unlink(filePath, (err) => {
      if (err) console.log(err.message);
    });
    return await this.uploadService.deleteFile(idPhoto, ctx);
  }
}
