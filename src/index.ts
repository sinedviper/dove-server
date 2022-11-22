import "reflect-metadata";
import * as dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { buildTypeDefsAndResolvers } from "type-graphql/dist/utils/buildTypeDefsAndResolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { Server } from "socket.io";
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
import { MessageType, stringifyMessage } from "graphql-ws";

dotenv.config();

(async (): Promise<void> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [ResolverUser, ResolverContact, ResolverChat, ResolverMessage],
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = http.createServer(app);
  // const io = new Server(httpServer, { path: "/graphql" });

  // const wsServer = new WebSocketServer({
  //   server: httpServer,
  //   path: "/graphql",
  // });

  // const serverCleanup = useServer(
  //   {
  //     schema,
  //     onDisconnect() {
  //       console.log("WebSocket disconnect!");
  //     },
  //     onConnect: (ctx: any) => {
  //       ctx.connectionParams = { id: "12323" };
  //       console.log(ctx);
  //       console.log("WebSocket connect!");
  //     },
  //   },
  //   wsServer
  // );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // {
      //   async serverWillStart() {
      //     return {
      //       async drainServer() {
      //         await serverCleanup.dispose();
      //       },
      //     };
      //   },
      // },
    ],
  });

  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res, autorization };
      },
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

  // io.on("connection", (socket) => {
  //   console.log("a user connected");
  //   socket.on("disconnect", () => {
  //     console.log("user disconnected");
  //   });
  // });

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization: ", err);
    });
})();
