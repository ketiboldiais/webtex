import { describe, expect, it } from "vitest";
import {
  integer,
  naturalNumber,
  negativeInteger,
  positiveInteger,
	unsignedDottedNumber,
	positiveFloat,
	negativeFloat,
	float,
} from "../../lib/lang/skim";

describe("nump", () => {
  it("should NOT parse 0", () => {
    const res = positiveInteger.run("0");
    const exp = {
      ...res,
      result: null,
    };
    expect(res).toEqual(exp);
  });
  it("should parse 5", () => {
    const res = positiveInteger.run("5");
    const exp = {
      ...res,
      result: "5",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 58", () => {
    const res = positiveInteger.run("58");
    const exp = {
      ...res,
      result: "58",
    };
    expect(res).toEqual(exp);
  });
  it("should parse -1", () => {
    const res = negativeInteger.run("-1");
    const exp = {
      ...res,
      result: "-1",
    };
    expect(res).toEqual(exp);
  });
  it("should NOT parse -", () => {
    const res = negativeInteger.run("-");
    const exp = {
      ...res,
      result: null,
    };
    expect(res).toEqual(exp);
  });
  it("should parse -238", () => {
    const res = negativeInteger.run("-238");
    const exp = {
      ...res,
      result: "-238",
    };
    expect(res).toEqual(exp);
  });
  it("should NOT parse -0", () => {
    const res = negativeInteger.run("-0");
    const exp = {
      ...res,
      result: null,
    };
    expect(res).toEqual(exp);
  });
  it("should parse 12", () => {
    const res = naturalNumber.run("12");
    const exp = {
      ...res,
      result: "12",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 0", () => {
    const res = naturalNumber.run("0");
    const exp = {
      ...res,
      result: "0",
    };
    expect(res).toEqual(exp);
  });
  it("should parse a 158", () => {
    const res = integer.run("158");
    const exp = {
      ...res,
      result: "158",
    };
    expect(res).toEqual(exp);
  });
  it("should parse -12", () => {
    const res = integer.run("-12");
    const exp = {
      ...res,
      result: "-12",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 0", () => {
    const res = integer.run("0");
    const exp = {
      ...res,
      result: "0",
    };
    expect(res).toEqual(exp);
  });
  it("should parse .1", () => {
    const res = unsignedDottedNumber.run(".1");
    const exp = {
      ...res,
      result: ".1",
    };
    expect(res).toEqual(exp);
  });
  it("should parse .0", () => {
    const res = unsignedDottedNumber.run(".0");
    const exp = {
      ...res,
      result: ".0",
    };
    expect(res).toEqual(exp);
  });
  it("should parse .00651", () => {
    const res = unsignedDottedNumber.run(".00651");
    const exp = {
      ...res,
      result: ".00651",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 12.651", () => {
    const res = positiveFloat.run("12.651");
    const exp = {
      ...res,
      result: "12.651",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 120.00651", () => {
    const res = positiveFloat.run("120.00651");
    const exp = {
      ...res,
      result: "120.00651",
    };
    expect(res).toEqual(exp);
  });

  it("should parse 1.0", () => {
    const res = positiveFloat.run("1.0");
    const exp = {
      ...res,
      result: "1.0",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 0.00651", () => {
    const res = positiveFloat.run("0.00651");
    const exp = {
      ...res,
      result: "0.00651",
    };
    expect(res).toEqual(exp);
  });
	


	
  it("should parse -1.0", () => {
    const res = negativeFloat.run("-1.0");
    const exp = {
      ...res,
      result: "-1.0",
    };
    expect(res).toEqual(exp);
  });
  it("should parse -0.00028", () => {
    const res = negativeFloat.run("-0.00028");
    const exp = {
      ...res,
      result: "-0.00028",
    };
    expect(res).toEqual(exp);
  });

  it("should parse -0.00028", () => {
    const res = float.run("-0.00028");
    const exp = {
      ...res,
      result: "-0.00028",
    };
    expect(res).toEqual(exp);
  });
	
  it("should parse -2910092.000928", () => {
    const res = float.run("-2910092.000928");
    const exp = {
      ...res,
      result: "-2910092.000928",
    };
    expect(res).toEqual(exp);
  });
	
  it("should parse 92.1228", () => {
    const res = float.run("92.1228");
    const exp = {
      ...res,
      result: "92.1228",
    };
    expect(res).toEqual(exp);
  });
  it("should parse 0.00028", () => {
    const res = float.run("0.00028");
    const exp = {
      ...res,
      result: "0.00028",
    };
    expect(res).toEqual(exp);
  });

  it("should parse 0.000000", () => {
    const res = float.run("0.000000");
    const exp = {
      ...res,
      result: "0.000000",
    };
    expect(res).toEqual(exp);
  });

  it("should parse 0.0000000001", () => {
    const res = float.run("0.0000000001");
    const exp = {
      ...res,
      result: "0.0000000001",
    };
    expect(res).toEqual(exp);
  });
});
