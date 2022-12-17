

const generateFunction = (args: string[], proc: string) => {
  return Function(...args, "return " + proc);
};

const add = generateFunction(["a", "b"], "a + b");
