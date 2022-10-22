import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { ContactModel, UserModel } from "../models";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.ADMIN,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  entities: [UserModel, ContactModel],
});
