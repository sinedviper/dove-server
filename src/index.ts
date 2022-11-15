import "reflect-metadata";
import * as dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { buildTypeDefsAndResolvers } from "type-graphql/dist/utils/buildTypeDefsAndResolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

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

  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const serverCleanup = useServer(
    {
      schema,
      onConnect() {
        console.log("WebSocket connect!");
      },
      onDisconnect() {
        console.log("WebSocket disconnect!");
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res, autorization }),
    })
  );

  await new Promise<void>((res) =>
    httpServer.listen({ port: Number(process.env.PORT) }, res)
  )
    .then(() => {
      console.log(
        `Server ready at http://localhost:${Number(process.env.PORT)}/graphql`
      );
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
