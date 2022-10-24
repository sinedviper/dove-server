import "reflect-metadata";
import * as dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildTypeDefsAndResolvers } from "type-graphql/dist/utils/buildTypeDefsAndResolvers";

import {
  ResolverUser,
  ResolverContact,
  ResolverChat,
  ResolverMessage,
} from "./resolvers";
import { AppDataSource } from "./utils";
import { autorization } from "./middleware";

dotenv.config();

(async (): Promise<void> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [ResolverUser, ResolverContact, ResolverChat, ResolverMessage],
  });

  const server = new ApolloServer({ typeDefs, resolvers });
  await startStandaloneServer(server, {
    context: async ({ req, res }) => ({ req, res, autorization }),
    listen: { port: Number(process.env.PORT) },
  })
    .then(({ url }) => {
      console.log(`Server ready at http://localhost:${url}graphql`);
    })
    .catch((err) => {
      console.error("ErrorServer: " + err);
    });

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization: ", err);
    });
})();
