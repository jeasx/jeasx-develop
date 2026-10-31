import { isJsxNode, jsxToString } from "jsx-async-runtime";

const HEAD_MARK = "[[HEAD]]";

/**
 * @this {import("../types").ThisContext}
 */
export default async function () {
  const headTags = [];

  // Useful pattern to retain existing overrides
  const $jsxToString = this.jsxToString || jsxToString;

  // Overwrite jsxToString with our head collector.
  // The first head is replaced with the HEAD_MARK,
  // all other heads are deleted.
  this.jsxToString = async (jsxElement) => {
    if (isJsxNode(jsxElement) && jsxElement.tag === "head") {
      headTags.push(jsxElement.props.children);
      return headTags.length === 1 ? HEAD_MARK : "";
    }
    return await $jsxToString.call(this, jsxElement);
  };

  // Use response handler to replace HEAD_MARK with unified head.
  this.responseHandler = async (payload) => {
    // Only rendered strings contain the mark (not streams, JSON etc.).
    if (typeof payload !== "string") {
      return payload;
    }
    const htmlHead = await $jsxToString.call(this, <head>{unifyHead(headTags.flat())}</head>);
    // Use a function, so "$&" or "$'" in the head isn't treated as a replacement pattern.
    return payload.replace(HEAD_MARK, () => htmlHead);
  };
}

// Title, meta description and keywords should be unique.
function unifyHead(jsxElements) {
  const lastIndex = {};
  for (let i = 0; i < jsxElements.length; i++) {
    const jsxElement = jsxElements[i];
    switch (jsxElement?.["tag"]) {
      case "title":
        if (lastIndex["title"] !== undefined) {
          delete jsxElements[lastIndex["title"]];
        }
        lastIndex["title"] = i;
        break;

      case "meta":
        switch (jsxElement?.["props"]?.["name"]) {
          case "keywords":
          case "description":
            const name = jsxElement["props"]["name"];
            if (lastIndex[name] !== undefined) {
              delete jsxElements[lastIndex[name]];
            }
            lastIndex[name] = i;
            break;
        }
        break;
    }
  }
  return jsxElements;
}
