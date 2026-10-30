import * as cheerio from "cheerio";

/**
 * @param {string} html
 */
export default function extractStyles(html) {
  const $ = cheerio.load(html);

  const styles = new Set();
  $("style").each((_, element) => {
    styles.add($(element).text());
    $(element).remove();
  });

  const declarations = new Map();
  let index = 0;
  $("*[style]").each((_, element) => {
    for (const declaration of $(element)
      .attr("style")
      .split(";")
      .map((item) => {
        // Split at the first colon only, so values like url(https://…) stay intact.
        const colon = item.indexOf(":");
        return colon === -1
          ? item.trim()
          : `${item.slice(0, colon).trim()}:${item.slice(colon + 1).trim()}`;
      })) {
      if (!declaration) {
        continue;
      }
      if (!declarations.has(declaration)) {
        declarations.set(declaration, index++);
      }
      $(element).addClass("c" + declarations.get(declaration));
    }
    $(element).removeAttr("style");
  });

  const classes = declarations
    .entries()
    .map(([k, v]) => {
      return `.c${v} {${k}}`;
    })
    .toArray();
  $("head").append(`<style>${Array.from(styles).join("\n")}${classes.join("\n")}</style>`);
  return $.html();
}
