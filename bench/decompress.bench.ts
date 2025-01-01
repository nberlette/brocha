import { brotliDecompressSync } from "node:zlib";
import brotliWasmInit from "npm:brotli-wasm";
import brotliDecWasmInit from "npm:brotli-dec-wasm";
import brotli_npm from "npm:brotli";
import decompress from "../mod.ts";
import { fixtures } from "../tests/fixtures/mod.ts";

const { decompress: brochaWasm } = await instantiate();

// both of these modules use the silly antipattern of exporting
// a Promise for their default export... we must await the promise
// to obtain the instantiated web assembly module o_O
const brotli_dec_wasm = await brotliDecWasmInit;
const brotli_wasm = await brotliWasmInit;

const targets = [
  {
    name: "brocha",
    fn: decompress,
    baseline: true,
  },
  {
    name: "npm:brotli",
    fn: brotli_npm.decompress,
  },
  {
    name: "npm:brotli-wasm",
    fn: brotli_wasm.decompress,
  },
  {
    name: "npm:brotli-dec-wasm",
    fn: brotli_dec_wasm.decompress,
  },
  {
    name: "node:zlib",
    fn: brotliDecompressSync,
  },
] as {
  name: string;
  fn(b: Uint8Array): Uint8Array;
  baseline?: boolean;
}[];

for (const fixture of fixtures) {
  const group = fixture.name;

  for (const target of targets) {
    Deno.bench({
      ...target,
      group,
      fn: () => {
        target.fn(fixture.input);
      },
    });
  }
}
