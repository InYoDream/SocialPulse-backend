import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { prismaClient } from "./db";
import express from "express";
import { User } from "./user/index";
import cors from "cors";
import JWTService from "../services/jwt";

export async function initServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  const server = new ApolloServer({
    typeDefs: `
            ${User.types}
            type Query{
                ${User.queries}
            }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });

  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({req, res}) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(req.headers.authorization.split('Bearer ')[1]): undefined,
        };
      },
    })
  );
  return app;
}
 