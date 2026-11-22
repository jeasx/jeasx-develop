// A tiny formula engine. It doesn't use the DOM or Node, so the server and the browser
// run exactly the same code. Formulas support numbers, cell references, + - * /,
// parentheses and SUM over a range, e.g. "=SUM(B2:B6) / 2".

/** All references of a range, e.g. "A1", "A2", "B1", "B2" for "A1:B2". */
function expand(from, to) {
  const refs = [];
  for (let col = from.charCodeAt(0); col <= to.charCodeAt(0); col++) {
    for (let row = Number(from.slice(1)); row <= Number(to.slice(1)); row++) {
      refs.push(String.fromCharCode(col) + row);
    }
  }
  return refs;
}

/**
 * Computes the values of all cells. Formulas become numbers or an error like "#DIV/0!",
 * other inputs are shown as they are.
 *
 * @param {Record<string, string>} cells The inputs by reference, e.g. { A1: "=B1*2" }.
 * @returns {Record<string, number | string>}
 */
export function evaluate(cells) {
  const values = {};
  const visiting = new Set();

  const valueOf = (ref) => {
    if (ref in values) return values[ref];
    const input = (cells[ref] ?? "").trim();
    if (!input.startsWith("=")) {
      return (values[ref] = input !== "" && !isNaN(Number(input)) ? Number(input) : input);
    }
    if (visiting.has(ref)) throw new Error("#CYCLE!");
    visiting.add(ref);
    try {
      values[ref] = calculate(input.slice(1));
    } catch (error) {
      values[ref] = error.message.startsWith("#") ? error.message : "#ERROR!";
    }
    visiting.delete(ref);
    return values[ref];
  };

  /** A cell used in a formula: empty cells count as 0, text can't be calculated. */
  const numberOf = (ref) => {
    const value = valueOf(ref);
    if (typeof value === "number") return value;
    if (value === "") return 0;
    throw new Error(value.startsWith("#") ? value : "#VALUE!");
  };

  const calculate = (formula) => {
    const expression = formula
      .toUpperCase()
      .replace(
        /SUM\(([A-Z]\d+):([A-Z]\d+)\)/g,
        (_, from, to) =>
          `(${expand(from, to)
            .map(numberOf)
            .reduce((a, b) => a + b, 0)})`,
      )
      .replace(/[A-Z]\d+/g, (ref) => `(${numberOf(ref)})`);
    const result = arithmetic(expression);
    if (!Number.isFinite(result)) throw new Error("#DIV/0!");
    return result;
  };

  for (const ref of Object.keys(cells)) valueOf(ref);
  return values;
}

/**
 * Calculates numbers with + - * / and parentheses, e.g. "(840)+(1260)/2".
 * Each function handles one level of precedence: sums of products of numbers.
 *
 * @param {string} expression
 */
function arithmetic(expression) {
  const tokens = expression.match(/\d+(\.\d+)?|\S/g) ?? [];
  let pos = 0;

  const sum = () => {
    let value = product();
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      value = tokens[pos++] === "+" ? value + product() : value - product();
    }
    return value;
  };
  const product = () => {
    let value = factor();
    while (tokens[pos] === "*" || tokens[pos] === "/") {
      value = tokens[pos++] === "*" ? value * factor() : value / factor();
    }
    return value;
  };
  const factor = () => {
    const token = tokens[pos++];
    if (token === "-") return -factor();
    if (token === "(") {
      const value = sum();
      if (tokens[pos++] !== ")") throw new Error("#ERROR!");
      return value;
    }
    if (!/^\d/.test(token ?? "")) throw new Error("#ERROR!");
    return Number(token);
  };

  const value = sum();
  if (pos < tokens.length) throw new Error("#ERROR!");
  return value;
}

/** How a value is shown in a cell, e.g. 1260 as "1,260". */
export function format(value) {
  return typeof value === "number"
    ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : String(value ?? "");
}
