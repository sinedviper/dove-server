import { DataSource } from "typeorm";
import { Users } from "./models";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "telegram",
  synchronize: true,
  entities: [Users],
});
