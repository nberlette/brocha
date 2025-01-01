import { describe, it } from "jsr:@std/testing@1/bdd";
import { expect } from "jsr:@std/expect@1";
import { decompress } from "../mod.ts";
import { fixtures } from "./fixtures/mod.ts";

describe("decompress", () => {
  it("is a function", () => {
    expect(typeof decompress).toBe("function");
  });

  it("is named 'decompress'", () => {
    expect(decompress.name).toBe("decompress");
  });

  it("has an arity of 2", () => {
    expect(decompress.length).toBe(2);
  });

  fixtures.forEach((fixture) => {
    if (fixture.name) {
      it(`should accurately decode ${fixture.name}`, () => {
        const output = decompress(fixture.input);
        expect(
          output.byteLength,
          `Expected decompressed size of ${fixture.output.byteLength} B, but the actual output size was ${output.byteLength} B. Oh shit!`,
        ).toBe(fixture.output.byteLength);

        expect(
          output,
          "Encountered invalid/corrupted after decompression.",
        ).toEqual(fixture.output);
      });
    }
  });
});
