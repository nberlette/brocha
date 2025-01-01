/**
 * Brocha: Fast universal (de)compression
 *
 * This is a TypeScript port of the code from the official google/brotli
 * repository, for decompressing Brotli-encoded data in JS environments.
 *
 * @author Nicholas Berlette <https://github.com/nberlette>
 * @license MIT (https://nick.mit-license.org)
 * @copyright 2024+ Nicholas Berlette. All rights reserved. (nick/brocha)
 * @copyright 2017 Google Inc. All rights reserved. (google/brotli)
 * @module brocha
 */
export * from "./src/decompress.ts";
export * from "./src/types.ts";
export * from "./src/state.ts";
// export * from "./src/errors.ts";

export { default } from "./src/decompress.ts";
