import { href } from "./domain/steps";
import type { RouteProps } from "../types";

export default function ({ reply }: RouteProps) {
  return reply.redirect(href("trip"));
}
