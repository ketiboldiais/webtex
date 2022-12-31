export const timestamp = (d = new Date()) =>
  [d.getFullYear(), d.getMonth(), d.getDay()]
    .map((t) => t.toString().padStart(2, '0'))
    .join('/')
    .concat('-')
    .concat(
      [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((t) => t.toString().padStart(2, '0'))
        .join(':')
    ).concat("-").concat(performance.now().toPrecision(7).toString());

console.log(timestamp());
