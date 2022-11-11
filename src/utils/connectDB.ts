import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { ContactModel, UserModel, ChatModel, MessageModel } from "../models";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.ADMIN,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  charset: "utf8mb4",
  entities: [UserModel, ContactModel, ChatModel, MessageModel],
});
