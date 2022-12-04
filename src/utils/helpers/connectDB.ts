import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { ChatModel } from "../../models/Chat";
import { ContactModel } from "../../models/Contact";
import { MessageModel } from "../../models/Message";
import { UserModel } from "../../models/User";
import { UploadModel } from "../../models/Upload";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.HOST,
  port: Number(process.env.PORT_DATABASE),
  username: process.env.ADMIN,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  charset: "utf8mb4",
  entities: [UserModel, ContactModel, ChatModel, MessageModel, UploadModel],
});
