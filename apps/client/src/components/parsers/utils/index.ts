import treeify from 'treeify';
export const log = (s: any, objPrintDepth: number = 50) => {
  let out = ``;
  if (Array.isArray(s)) {
    out = `[${s}]`;
    console.log(s);
    return out;
  }
  if (typeof s === 'object') {
    function print(obj: any, maxDepth: number, prefix: string = "") {
      let result = '';
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          let a = '[';
          for (let i = 0; i < obj[key].length; i++) {
            let val = typeof obj[key][i] === 'string' ? `'${obj[key][i]}'` : obj[key][i];
            a += ` ${val}` + (i !== obj[key].length ? ' ' : '');
          }
          a += ']' + '\n';
          result += `\t| array`.padEnd(11) + `| ` + `${key}: ` + a;
        } else if (typeof obj[key] == 'object') {
          if (maxDepth !== undefined && maxDepth <= 1) {
            result += prefix + key + '=object [max depth reached]\n';
          } else {
            result += print(
              obj[key],
              maxDepth ? maxDepth - 1 : maxDepth,
              prefix + key + '.'
            );
          }
        } else {
          result +=
            `\t| ${typeof obj[key]}`.padEnd(11) + `| ` +
            key +
            ': ' +
            (typeof obj[key] === 'string' ? `'${obj[key]}'` : obj[key]) +
            '\n';
        }
      }
      return `[object]\n` + result;
    }
    out = print(s, 50);
    console.log(out);
    return out;
  }
  console.log(s);
  return out;
};
export const display = (x: any) => console.log(treeify.asTree(x, true, true));

export function substring(
  str: string,
  start?:
    | number
    | 'first-half-floor'
    | 'first-half-ceil'
    | 'second-half-floor'
    | 'second-half-ceil',
  end?: number
) {
  if (start === 'second-half-floor') {
    const half = Math.floor(str.length / 2);
    return str.slice(half);
  }
  if (start === 'second-half-ceil') {
    const half = Math.ceil(str.length / 2);
    return str.slice(half);
  }
  if (start === 'first-half-floor') {
    const half = Math.floor(str.length / 2);
    return str.slice(0, half);
  }
  if (start === 'first-half-ceil') {
    const half = Math.ceil(str.length / 2);
    return str.slice(0, half);
  }
  return end === undefined ||
    start === undefined ||
    start < 0 ||
    end < 0 ||
    !Number.isInteger(start) ||
    !Number.isInteger(end)
    ? str
    : str.slice(start, end + 1);
}
