type monoid<t> = {
  x: t;
  id(): monoid<t>;
  concat(x: monoid<t>): monoid<t>;
};

const natsum = (x: number = 0): monoid<number> => ({
  x: Math.abs(Math.floor(x)),
  concat: (y) => natsum(x + y.x),
  id: () => natsum(0),
});

const natprod = (x: number = 1): monoid<number> => ({
  x: Math.abs(Math.floor(x)),
  concat: (y) => natprod(x * y.x),
  id: () => natprod(1),
});

const res = [1, 2, 3, 4, 5].map(natsum).reduce((a, n) => a.concat(n), natsum());
console.log(res);
