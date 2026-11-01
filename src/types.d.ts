import "@fastify/cookie";
import "@fastify/multipart";
import type { FastifyReply, FastifyRequest } from "fastify";
import "../serverless";

type RouteProps = {
  request: FastifyRequest;
  reply: FastifyReply;
};

type ThisContext = RouteProps & {
  jsxToString?: (this: ThisContext, jsxElement: JSX.Element) => string | Promise<string>;
  responseHandler?: (this: ThisContext, payload: any) => unknown;
};
