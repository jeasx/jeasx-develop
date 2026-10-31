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
      // Cheerio decodes attributes, so "&lt;/style&gt;" in a style attribute comes back
      // as "</style>" and would close the <style> tag below, letting markup (e.g. a script)
      // escape into the page. CSS declarations never need "<", so skip those.
      if (!declaration || declaration.includes("<")) {
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
