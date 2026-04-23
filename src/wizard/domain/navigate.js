import flow from "./flow";

/**
 * @param {string} path
 * @param {{ [x: string]: { [x: string]: string | string[]; }; }} data
 * @returns {{ previous: string; next: string; }}
 */
export default function navigate(path, data) {
  const steps = flow(data);
  const index = steps.findIndex((item) => item === path);
  return {
    previous: index > 0 ? steps[index - 1] : "",
    next: steps[index + 1],
  };
}
