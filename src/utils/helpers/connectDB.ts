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
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  synchronize: true,
  charset: "utf8mb4",
  entities: [UserModel, ContactModel, ChatModel, MessageModel, UploadModel],
});
