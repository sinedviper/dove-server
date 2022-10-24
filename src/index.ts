import "reflect-metadata";
import * as dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildTypeDefsAndResolvers } from "type-graphql/dist/utils/buildTypeDefsAndResolvers";
import { expressMiddleware } from "@apollo/server/express4";
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

//import cors from "cors";
// import http from "http";
// import express, { json } from "express";
// import cookieParser from "cookie-parser";
// import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// import { expressMiddleware } from "@apollo/server/express4";
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// });

// await server.start();

// app.use(
//   "/graphql",
//   cookieParser(),
//   cors(),
//   json(),
//   expressMiddleware(server, {
//     context: async ({ req, res }) => ({ req, res, autorization }),
//   })
// );

// await new Promise<void>((resolve) =>
//   httpServer.listen({ port: process.env.PORT }, resolve)
// );
