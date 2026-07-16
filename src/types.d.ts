import "@fastify/cookie";
import "@fastify/multipart";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import "../serverless";

type RouteProps = {
  request?: FastifyRequest;
  reply?: FastifyReply;
};

type ThisContext = RouteProps & {};
