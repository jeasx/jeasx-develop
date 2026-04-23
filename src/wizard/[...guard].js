import { SLUGS } from "./domain/constants";
import navigate from "./domain/navigate";
import validator from "./domain/validator";
import { compress, decompress } from "./utils/zip";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  try {
    const props = {
      data: decompress(request.cookies["data"]) || {},
      errors: {},
      previous: "",
      next: "",
      form: {},
    };

    const path = request.path;
    const { previous, next } = navigate(path, props.data);

    props.previous = previous;
    props.next = next;

    if (request.body) {
      if (request.body["$hash"]) {
        props.data = decompress(request.cookies[request.body["$hash"]]) || {};
      }

      const data = convertBodyToData(request.body);
      if (Object.keys(data).length > 0) {
        props.data[path] = data;
      } else {
        delete props.data[path];
      }

      reply.setCookie("data", compress({ ...props.data, path }));

      switch (request.body["$action"] || "") {
        case "":
          break;
        case "Save":
          return reply.redirect(SLUGS.SAVE);
        case "Back":
          return reply.redirect(props.previous);
        default:
          props.errors = validator(path, props.data[path]);
          if (Object.keys(props.errors).length === 0) {
            return reply.redirect(props.next);
          }
      }
    }

    props.form = props.data[path] || {};
    return props;
  } catch (error) {
    console.error(error);
    reply.clearCookie("data");
    return reply.redirect(SLUGS.START);
  }
}

function convertBodyToData(body) {
  const map = new Map();
  Object.keys(body)
    .filter((key) => !key.startsWith("$"))
    .forEach((key) => {
      map.set(key, body[key]);
    });
  return Object.fromEntries(map.entries());
}
