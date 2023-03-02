export const op = {
  relation: {
    ["<"]: {},
    [">"]: {},
    [">="]: {},
    ["<="]: {},
    ["=="]: {},
    ["!="]: {},
    ["="]: {},
  },
  bitwise: {
    ["&"]: {},
    ["^|"]: {},
    ["<<"]: {},
    [">>"]: {},
    [">>>"]: {},
    ["~"]: {},
  },
  function: {
    ["call"]: {},
    ["list"]: {},
    ["tuple"]: {},
    ["block"]: {},
    [`'`]: {},
  },
  logic: {
    ["nor"]: {},
    ["not"]: {},
    ["or"]: {},
    ["xor"]: {},
    ["xnor"]: {},
    ["and"]: {},
    ["nand"]: {},
    ["?"]: {},
  },
  arithmetic: {
    ["+"]: {},
    ["-"]: {},
    ["*"]: {},
    ["/"]: {},
    ["%"]: {},
    ["^"]: {},
    ["!"]: {},
    ["mod"]: {},
    ["rem"]: {},
    ["to"]: {},
  },
  functionDef: {
    [":="]: {},
  },
  variableDef: {
    [":="]: {},
  },
};
