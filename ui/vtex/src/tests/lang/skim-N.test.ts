import { describe, expect, it, test } from "vitest";
import { number } from "../../lib/lang";

describe("N", () => {
  it("should parse only whole numbers", () => {
    const P = number("whole");
    const res = P.run(`258`);
    const exp = {
      text: `258`,
      result: "258",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 0", () => {
    const P = number("0");
    const res = P.run("0");
    const exp = {
      text: "0",
      result: "0",
      index: 1,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 20", () => {
    const P = number("natural");
    const res = P.run("20");
    const exp = {
      text: "20",
      result: "20",
      index: 2,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse +157", () => {
    const P = number("+int");
    const res = P.run("+157");
    const exp = {
      text: "+157",
      result: "+157",
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse 34", () => {
    const P = number("+int");
    const res = P.run("34");
    const exp = {
      ...res,
      result: null,
      index: 0,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should not parse +0", () => {
    const P = number("+int");
    const res = P.run("+0");
		const error = res.error;
    const exp = {
      text: "+0",
      result: null,
      index: 0,
      erred: true,
			error 
    };
    expect(res).toEqual(exp);
  });

  it("should parse -28", () => {
    const P = number('-int');
    const res = P.run("-28");
    const exp = {
      text: "-28",
      result: "-28",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse -0", () => {
    const P = number('-int');
    const res = P.run("-0");
    const exp = {
			...res,
      result: null,
      index: 0,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should parse -28", () => {
    const P = number('int');
    const res = P.run("-28");
    const exp = {
      text: "-28",
      result: "-28",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should not parse 0", () => {
    const P = number("int");
    const res = P.run("0");
		const error = res.error;
    const exp = {
      text: '0',
      result: '0',
      index: 1,
      erred: false,
			error 
    };
    expect(res).toEqual(exp);
  });

  it("should not parse 5", () => {
    const P = number("int");
    const res = P.run("5");
		const error = res.error;
    const exp = {
      text: '5',
      result: '5',
      index: 1,
      erred: false,
			error 
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse +5", () => {
    const P = number("int");
    const res = P.run("+5");
    const exp = {
			...res,
      result: null,
			erred: true,
    };
    expect(res).toEqual(exp);
  });

  
  it("should parse 1.1", () => {
    const P = number('ufloat');
    const res = P.run("1.1");
    const exp = {
      ...res,
      result: "1.1",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 0.0", () => {
    const P = number('ufloat');
    const res = P.run("0.0");
    const exp = {
      ...res,
      result: "0.0",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse 0", () => {
    const P = number('ufloat');
    const res = P.run("0");
    const exp = {
      ...res,
      result: null,
      index: 0,
      erred: true,
    };
    expect(res).toEqual(exp);
  });



  it("should parse 1.3912", () => {
    const P = number('ufloat');
    const res = P.run("1.3912");
    const exp = {
      ...res,
      result: "1.3912",
      index: 6,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 0.390", () => {
    const P = number('ufloat');
    const res = P.run("0.390");
    const exp = {
      ...res,
      result: "0.390",
      index: 5,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse +1.0", () => {
    const P = number('+float');
    const res = P.run("+1.0");
    const exp = {
      ...res,
      result: "+1.0",
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse +0.0001", () => {
    const P = number('+float');
    const res = P.run("+0.0001");
    const exp = {
      ...res,
      result: "+0.0001",
      index: 7,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse 0.0", () => {
    const P = number('+float');
    const res = P.run("0.0");
    const exp = {
      ...res,
      result: null,
      index: 0,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should parse -1.2", () => {
    const P = number('-float');
    const res = P.run("-1.2");
    const exp = {
      ...res,
      result: '-1.2',
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse -0.0", () => {
    const P = number('-float');
    const res = P.run("-0.0");
    const exp = {
      ...res,
      result: null,
      index: 0,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should parse .0", () => {
    const P = number("udotnum");
    const res = P.run(`.0`);
    const exp = {
      ...res,
      result: ".0",
      index: 2,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse .001", () => {
    const P = number("udotnum");
    const res = P.run(`.001`);
    const exp = {
      ...res,
      result: ".001",
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse -.001", () => {
    const P = number("-dotnum");
    const res = P.run(`-.001`);
    const exp = {
      ...res,
      result: "-.001",
      index: 5,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse -.0", () => {
    const P = number("-dotnum");
    const res = P.run(`-.0`);
    const exp = {
      ...res,
      result: null,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse +.0", () => {
    const P = number("+dotnum");
    const res = P.run(`+.0`);
    const exp = {
      ...res,
      result: null,
      erred: true,
    };
    expect(res).toEqual(exp);
  });

  it("should parse +.291", () => {
    const P = number("+dotnum");
    const res = P.run(`+.291`);
    const exp = {
      ...res,
      result: "+.291",
      index: 5,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 3.147", () => {
    const P = number('float');
    const res = P.run(`3.147`);
    const exp = {
      ...res,
      result: "3.147",
      index: 5,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse 2.3", () => {
    const P = number('float');
    const res = P.run(`2.3`);
    const exp = {
      ...res,
      result: "2.3",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse -0.1", () => {
    const P = number('float');
    const res = P.run(`-0.1`);
    const exp = {
      ...res,
      result: "-0.1",
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });
  it("should parse 5.20", () => {
    const P = number('float');
    const res = P.run(`5.20`);
    const exp = {
      ...res,
      result: "5.20",
      index: 4,
      erred: false,
    };
    expect(res).toEqual(exp);
  });
  it("should NOT parse -0.0", () => {
    const P = number('float');
    const res = P.run(`-0.0`);
    const exp = {
      ...res,
      result: null,
      erred: true,
      index: 0,
    };
    expect(res).toEqual(exp);
  });
  it("should parse 0.0", () => {
    const P = number('float');
    const res = P.run(`0.0`);
    const exp = {
      ...res,
      result: "0.0",
      index: 3,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse -0.0001", () => {
    const P = number('float');
    const res = P.run(`-0.0001`);
    const exp = {
      ...res,
      result: "-0.0001",
      index: 7,
      erred: false,
    };
    expect(res).toEqual(exp);
  });
  
  it("should parse 0.0001", () => {
    const P = number('float');
    const res = P.run(`0.0001`);
    const exp = {
      ...res,
      result: "0.0001",
      index: 6,
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a case-insensitive hex number", () => {
    const P = number('hex');
    const res = P.run(`0xafed`);
    const exp = {
      ...res,
      result: "0xafed",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a case-sensitive hex number", () => {
    const P = number('HEX');
    const res = P.run(`0xAF2E9D`);
    const exp = {
      ...res,
      result: "0xAF2E9D",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse an octal number", () => {
    const P = number('octal');
    const res = P.run(`0o01272`);
    const exp = {
      ...res,
      result: "0o01272",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a binary number", () => {
    const P = number('binary');
    const res = P.run(`0b101101`);
    const exp = {
      ...res,
      result: "0b101101",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a fraction", () => {
    const P = number('fraction');
    const res = P.run(`1/2`);
    const exp = {
      ...res,
      result: "1/2",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a signed fraction", () => {
    const P = number('signed-fraction');
    const res = P.run(`+1/2`);
    const exp = {
      ...res,
      result: "+1/2",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a negative, cap scientific number", () => {
    const P = number('SCIENTIFIC');
    const res = P.run(`-1.2E5`);
    const exp = {
      ...res,
      result: "-1.2E5",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a lower-case, negative scientific number", () => {
    const P = number('scientific');
    const res = P.run(`-1.2e5`);
    const exp = {
      ...res,
      result: "-1.2e5",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a lower-case, negative scientific number with a signed exponent", () => {
    const P = number('scientific');
    const res = P.run(`-1.2e+5`);
    const exp = {
      ...res,
      result: "-1.2e+5",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse an upper-case, dotted, scientific number with a signed exponent", () => {
    const P = number('SCIENTIFIC');
    const res = P.run(`.2E-5`);
    const exp = {
      ...res,
      result: ".2E-5",
      erred: false,
    };
    expect(res).toEqual(exp);
  });

  it("should parse a lower-case, dotted, scientific number with a positive exponent", () => {
    const P = number('scientific');
    const res = P.run(`+.2e+5`);
    const exp = {
      ...res,
      result: "+.2e+5",
      erred: false,
    };
    expect(res).toEqual(exp);
  });
  it("should NOT parse +.2", () => {
    const P = number('scientific');
    const res = P.run(`+.2`);
    const exp = {
      ...res,
      result: null,
      erred: true,
      index: 0,
    };
    expect(res).toEqual(exp);
  });

  it("should NOT parse +2.", () => {
    const P = number('dotnum');
    const res = P.run(`+2.`);
    const exp = {
      ...res,
      result: null,
      erred: true,
      index: 0,
    };
    expect(res).toEqual(exp);
  });
});
