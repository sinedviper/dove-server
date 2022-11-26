import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import fs from "fs";

import { UploadResponse } from "../models/Upload";
import { IContext } from "../utils/interfaces";
import { UploadService } from "../services";

@Resolver(() => UploadResponse)
export class ResolverUpload {
  constructor(private uploadService: UploadService) {
    this.uploadService = new UploadService();
  }

  @Query(() => UploadResponse)
  async getUpload(@Ctx() ctx: IContext) {
    console.log(await this.uploadService.findFiles(ctx));
    return await this.uploadService.findFiles(ctx);
  }

  @Mutation(() => UploadResponse)
  async deleteUpload(
    @Arg("file") file: string,
    @Arg("id") id: number,
    @Ctx() ctx: IContext
  ) {
    const filePath = __dirname + "/images/" + file;
    fs.rmSync(filePath);
    return await this.uploadService.deleteFile(id, ctx);
  }
}
