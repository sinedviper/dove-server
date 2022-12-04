import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { buildTypeDefsAndResolvers } from "type-graphql";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import multer from "multer";
import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";

import {
  ResolverUser,
  ResolverContact,
  ResolverChat,
  ResolverMessage,
  ResolverUpload,
} from "./resolvers";
import { AppDataSource, storage } from "./utils/helpers";
import { autorization } from "./middleware";
import { UploadService } from "./services";
import { invalid } from "./utils/constants";

dotenv.config();

(async (): Promise<void> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [
      ResolverUser,
      ResolverContact,
      ResolverChat,
      ResolverMessage,
      ResolverUpload,
    ],
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  const uploadService = new UploadService();

  const upload = multer({ storage });

  app.use("/images", express.static(__dirname + "/images/"));
  app.post(
    "/upload",
    async (req, res, next) => {
      const auth = await autorization(req);
      if (auth?.id === undefined) {
        return res.json({
          status: invalid,
          code: 401,
          message: "Unauthorized",
        });
      }
      next();
    },
    upload.single("image"),
    async (req, res) =>
      res.json(
        await uploadService.addFile(req.file.originalname, {
          req,
          res,
          autorization,
        })
      )
  );

  app.use(
    "/graphql",
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res, autorization }),
    })
  );

  await new Promise<void>((res) =>
    httpServer.listen(
      { port: Number(process.env.PORT) ? Number(process.env.PORT) : 3001 },
      res
    )
  )
    .then(() => {
      console.log(
        `Server ready at http://localhost:${
          Number(process.env.PORT) ? Number(process.env.PORT) : 3001
        }/graphql`
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
      console.error("Error during Data Source initialization: ", err.message);
    });
})();
