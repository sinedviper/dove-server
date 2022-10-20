import "reflect-metadata";
import cors from "cors";
import * as dotenv from "dotenv";
import http from "http";
import express, { json } from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { buildTypeDefsAndResolvers } from "type-graphql/dist/utils/buildTypeDefsAndResolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";

import { ResolverUser } from "./resolvers";
import deserializeUser from "./middleware/deserializeUser";
import { AppDataSource } from "./utils";

dotenv.config();

(async (): Promise<void> => {
  const app = express();
  const httpServer = http.createServer(app);

  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [ResolverUser],
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cookieParser(),
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res, deserializeUser }),
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  );
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`
  );

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization: ", err);
    });
})();
