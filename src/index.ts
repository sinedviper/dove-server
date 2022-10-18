import "reflect-metadata";
import express from "express";
import cors from "cors";
import { buildTypeDefsAndResolvers } from "type-graphql";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import http from "http";
import { json } from "body-parser";

import { ResolverUser } from "./models/User/ResolverUser";
import { AppDataSource } from "./db";

(async (): Promise<void> => {
  const app = express();
  const httpServer = http.createServer(app);

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization: ", err);
    });

  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [ResolverUser],
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 3001 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:3001/graphql`);
})();
