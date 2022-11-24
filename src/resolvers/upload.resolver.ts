import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import fs from "ts-fs-promise";

import { UploadResponse } from "../models/Upload";
import { IContext } from "../utils/interfaces";
import { UploadService } from "../services";
import storeUpload from "../utils/helpers/storeUpload";

@Resolver(() => UploadResponse)
export class ResolverUpload {
  constructor(private uploadService: UploadService) {
    this.uploadService = new UploadService();
  }

  @Query(() => UploadResponse)
  async getUpload(@Ctx() ctx: IContext) {
    return await this.uploadService.findFiles(ctx);
  }

  @Mutation(() => UploadResponse)
  async addUpload(
    @Arg("upload", () => GraphQLUpload) upload: FileUpload,
    @Ctx() ctx: IContext
  ) {
    const file = await storeUpload(upload);
    return await this.uploadService.addFile(file, ctx);
  }

  @Mutation(() => UploadResponse)
  async deleteUpload(
    @Arg("file") file: string,
    @Arg("id") id: number,
    @Ctx() ctx: IContext
  ) {
    //await fs.remove(__dirname + "src/images/" + file);
    return await this.uploadService.deleteFile(id, ctx);
  }
}
