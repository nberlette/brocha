<div align="center">

<!-- # [![`@nick/brocha`](./.github/assets/banner_2.png)][JSR] -->

# [<picture><source media="(prefers-color-scheme: dark)" type="image/png" srcset="./.github/assets/banner.png" /><source media="(prefers-color-scheme: light)" type="image/png" srcset="./.github/assets/banner_light.png" /><source type="image/svg+xml" srcset="./.github/assets/banner.svg" /><img src="./.github/assets/banner.png" alt="@nick/brocha" /></picture>][npm:brocha]

![][badge-jsr-score] ![][badge-jsr-pkg] ![][badge-npm]

</div>

---

This package provides a blazing fast TypeScript implementation of the [Brotli]
decompression algorithm, suitable for use in any ES2015+ environment. It offers
a performant, portable, and reliable alternative to existing solutions, with
support for custom dictionaries and a small footprint.

[Benchmarks](#benchmarks) show it to be nearly as fast as WebAssembly-based
decoders, and significantly faster than JavaScript-only alternatives.

## Install

<picture align="left" width="32" height="48">
  <source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/simple-icons:deno.svg?height=2.75rem&width=3rem&color=%23fff" />
  <img align="left" src="https://api.iconify.design/simple-icons:deno.svg?height=2.75rem&width=3rem" alt="Deno" width="32" height="48" />
</picture>

```sh
deno add jsr:@nick/brocha
```

<img align="left" src="https://api.iconify.design/simple-icons:jsr.svg?color=%23fb0" alt="JSR" width="32" height="48" />

```sh
npx jsr add @nick/brocha
```

<img align="left" src="https://api.iconify.design/logos:bun.svg" alt="Bun" width="32" height="48" />

```sh
bunx jsr add @nick/brocha
```

<img align="left" src="https://api.iconify.design/devicon:pnpm.svg?height=2.5rem&width=2.5rem&inline=true" alt="PNPM" width="32" height="48" />

```sh
pnpm dlx jsr add @nick/brocha
```

<img align="left" src="https://api.iconify.design/logos:yarn.svg?height=2rem&width=2rem&inline=true" alt="Yarn" width="32" height="48" />

```sh
yarn add @nick/brocha
```

<br>

**Mirrored on NPM as `brocha`**:

<img align="left" src="https://api.iconify.design/logos:npm.svg?height=2rem&width=2rem&inline=true" alt="NPM" width="32" height="48" />

```sh
npm i brocha
```

---

## Usage

```ts
import { decompress } from "@nick/brocha";

const response = await fetch("file:///compressed.br");
const compressedData = new Uint8Array(await response.arrayBuffer());

const decompressedData = decompress(compressedData);

console.log(
  `Decompressed ${compressedData.length}B -> ${decompressedData.length}B`,
);
```

> [!TIP]
>
> The `decompress` function is ready to use immediately upon import. Simply pass
> in your Brotli-compressed data and receive the decompressed `Uint8Array`.

---

## API

### `decompress`

Decompresses Brotli-encoded data into a `Uint8Array`.

#### Signature

```ts ignore
decompress(input: BufferSource, options?: BrotliDecodeOptions): Uint8Array;
```

#### Parameters

- `input`: The Brotli-compressed [`BufferSource`] to be decoded.
- `options`: Optional decompression options, allowing you to use a custom
  dictionary.

#### Returns

- `Uint8Array`: The decompressed data.

#### Examples

**Decompressing a Brotli-compressed file:**

```ts no-eval
import { decompress } from "@nick/brocha";
import * as fs from "node:fs";

const compressed = fs.readFileSync("data.br");
const decompressed = decompress(compressed);

const inputKB = (compressed.byteLength / 1024).toFixed(0);
const outputKB = (decompressed.byteLength / 1024).toFixed(0);
console.log(
  `${inputKB}K → ${outputKB}K (+${(outputKB / inputKB).toFixed(2)}x)`,
);
// Example log: "115K → 483K (+4.20x)"
```

**Using a custom dictionary:**

```ts no-eval
import { decompress } from "@nick/brocha";

const compressedData = /* Brotli-compressed data */;
const dictionary = new Uint8Array([/* custom dictionary bytes */]);

const options = { customDictionary: dictionary };
const decompressedData = decompress(compressedData, options);

console.log(decompressedData);
```

---

### `BrotliDecodeOptions`

Options to customize the behavior of the Brotli decompression process.

```ts
interface BrotliDecodeOptions {
  customDictionary?: BufferSource | null;
}
```

#### `customDictionary` (`BufferSource | null`)

Custom dictionary to use for the Brotli decompression.

##### Default

`null` _(uses the default dictionary)_

##### Remarks

The dictionary **must** be a valid Brotli dictionary that **exactly** matches
the one used when the input data was compressed. Otherwise, the decompressor
will either throw an exception or corrupted data will be returned.

---

## Benchmarks

This package is designed to be lightweight and fast, with a focus on performance
and efficiency. The following benchmarks were run on a 2021 MacBook Pro with an
M1 Pro chip using Deno 2.1.2.

The results demonstrate the performance of this package compared to other
popular Brotli decompression tools, suggesting it is a viable alternative to
existing [WebAssembly-based solutions](#webassembly-decoders).

- Performance is mostly on par with WebAssembly decoders like [brotli-wasm],
  which typically show small speed advantages of ~15-20% over this package.
- Compared to other pure-JS implementations (specifically [npm:brotli]),
  `brocha` consistently clocks speeds ~1.75x faster across all benchmarks.
- Performance is about 35-50% that of the native Node.js `node:zlib` module.

> [!NOTE]
>
> The native `node:zlib` module is written in C++ and is highly optimized for
> performance. While _"~2.5x slower"_ sounds like a poor result, it's actually
> quite fast for a pure JavaScript implementation, which will never be able to
> match the performance of a native module.

```sh
> deno bench -A --no-check

benchmark             time/iter (avg)        iter/s      (min … max)           p75      p99     p995
--------------------- ----------------------------- --------------------- --------------------------

group basic json (6.5 KB -> 27.5 KB)

jsr:@nick/brocha             399.0 µs         2,506 (324.8 µs …   3.1 ms) 381.8 µs   1.6 ms   2.1 ms
npm:brotli                   666.1 µs         1,501 (553.7 µs …   3.0 ms) 626.2 µs   1.9 ms   2.3 ms
npm:brotli-wasm              322.5 µs         3,101 (265.4 µs …   7.0 ms) 276.6 µs   1.7 ms   2.5 ms
npm:brotli-dec-wasm          306.7 µs         3,261 (279.2 µs …   4.7 ms) 288.3 µs 915.1 µs   1.6 ms
node:zlib                    144.5 µs         6,921 (136.5 µs …   1.8 ms) 141.8 µs 194.1 µs 245.7 µs

summary
  jsr:@nick/brocha
     2.76x slower than node:zlib
     1.30x slower than npm:brotli-dec-wasm
     1.24x slower than npm:brotli-wasm
     1.67x faster than npm:brotli

group dprint-plugin-graphql.wasm (147 KB -> 768 KB)

jsr:@nick/brocha               6.5 ms         154.0 (  6.0 ms …   7.7 ms)   6.7 ms   7.7 ms   7.7 ms
npm:brotli                    12.2 ms          82.1 ( 10.6 ms …  57.6 ms)  11.3 ms  57.6 ms  57.6 ms
npm:brotli-wasm                6.5 ms         153.3 (  5.9 ms …  31.6 ms)   6.1 ms  31.6 ms  31.6 ms
npm:brotli-dec-wasm            6.3 ms         158.8 (  6.2 ms …   7.1 ms)   6.3 ms   7.1 ms   7.1 ms
node:zlib                      3.4 ms         292.2 (  3.2 ms …   4.6 ms)   3.5 ms   4.2 ms   4.6 ms

summary
  jsr:@nick/brocha
     1.90x slower than node:zlib
     1.03x slower than npm:brotli-dec-wasm
     1.00x faster than npm:brotli-wasm
     1.88x faster than npm:brotli

group dprint-plugin-jupyter.wasm (354 KB -> 1.68 MB)

jsr:@nick/brocha              14.4 ms          69.6 ( 13.8 ms …  15.1 ms)  14.5 ms  15.1 ms  15.1 ms
npm:brotli                    26.2 ms          38.1 ( 25.3 ms …  30.1 ms)  26.7 ms  30.1 ms  30.1 ms
npm:brotli-wasm               13.9 ms          71.8 ( 13.6 ms …  15.4 ms)  14.0 ms  15.4 ms  15.4 ms
npm:brotli-dec-wasm           14.8 ms          67.4 ( 14.4 ms …  16.6 ms)  14.9 ms  16.6 ms  16.6 ms
node:zlib                      8.8 ms         114.2 (  8.5 ms …  10.1 ms)   8.8 ms  10.1 ms  10.1 ms

summary
  jsr:@nick/brocha
     1.64x slower than node:zlib
     1.03x slower than npm:brotli-wasm
     1.03x faster than npm:brotli-dec-wasm
     1.82x faster than npm:brotli

group dprint-plugin-typescript.wasm (746 KB -> 4.01 MB)

jsr:@nick/brocha              36.5 ms          27.4 ( 33.3 ms …  41.5 ms)  37.8 ms  41.5 ms  41.5 ms
npm:brotli                    63.4 ms          15.8 ( 59.6 ms …  76.9 ms)  64.4 ms  76.9 ms  76.9 ms
npm:brotli-wasm               31.6 ms          31.6 ( 30.8 ms …  32.4 ms)  31.9 ms  32.4 ms  32.4 ms
npm:brotli-dec-wasm           33.8 ms          29.6 ( 33.0 ms …  34.4 ms)  34.0 ms  34.4 ms  34.4 ms
node:zlib                     18.6 ms          53.8 ( 17.9 ms …  19.6 ms)  18.8 ms  19.6 ms  19.6 ms

summary
  jsr:@nick/brocha
     1.96x slower than node:zlib
     1.16x slower than npm:brotli-wasm
     1.08x slower than npm:brotli-dec-wasm
     1.74x faster than npm:brotli

group ten megs of lipsum (1.71 MB -> 9.77 MB)

jsr:@nick/brocha              65.3 ms          15.3 ( 63.3 ms …  69.5 ms)  65.6 ms  69.5 ms  69.5 ms
npm:brotli                   117.3 ms           8.5 (111.7 ms … 122.4 ms) 119.8 ms 122.4 ms 122.4 ms
npm:brotli-wasm               49.1 ms          20.4 ( 46.3 ms …  51.7 ms)  49.7 ms  51.7 ms  51.7 ms
npm:brotli-dec-wasm           56.4 ms          17.7 ( 52.5 ms …  76.7 ms)  56.6 ms  76.7 ms  76.7 ms
node:zlib                     33.1 ms          30.2 ( 29.7 ms …  91.5 ms)  31.0 ms  91.5 ms  91.5 ms

summary
  jsr:@nick/brocha
     1.97x slower than node:zlib
     1.33x slower than npm:brotli-wasm
     1.16x slower than npm:brotli-dec-wasm
     1.80x faster than npm:brotli
```

> The `decompress` function from this package is the baseline, with some other
> popular Brotli decompression tools for comparison.

---

### Prior Art

This project was adapted from the original [brotli] source code, developed by
the Google Brotli team and licensed under the MIT license.

#### WebAssembly Decoders

- [brotli-decompressor]
- [brotli-dec-wasm]
- [brotli-wasm]

#### JavaScript Decoders

- [npm:brotli]

---

<div align="center">

##### [MIT] © [Nicholas Berlette]. All rights reserved.

###### [GitHub] • [Issues] • [JSR] • [NPM]

<br>

[![JSR][JSR-badge]][JSR] [![JSR][badge-jsr-score]][JSR]

</div>

[MIT]: https://nick.mit-license.org "MIT © 2024+ Nicholas Berlette. All rights reserved."
[Nicholas Berlette]: https://github.com/nberlette "Nicholas Berlette on GitHub"
[GitHub]: https://github.com/nberlette/brocha "View the @nick/brocha project on GitHub"
[Issues]: https://github.com/nberlette/brocha/issues "View issues for the @nick/brocha project on GitHub"
[JSR]: https://jsr.io/@nick/brocha/doc "View the @nick/brocha documentation on jsr.io"
[NPM]: https://www.npmjs.com/package/brocha "View the brocha package on npm"
[brotli-decompressor]: https://crates.io/crates/brotli-decompressor "View the brotli-decompressor crate on crates.io"
[brotli-wasm]: https://crates.io/brotli-wasm "View the brotli-wasm crate on crates.io"
[brotli-dec-wasm]: https://crates.io/brotli-dec-wasm "View the brotli-dec-wasm crate on crates.io"
[jsr-badge]: https://jsr.io/badges/@nick "Install @nick/brocha with JSR"
[badge-npm]: https://img.shields.io/npm/v/brocha?logo=npm&color=firebrick&labelColor=firebrick&label= "View brocha on npm"
[badge-jsr-nick]: https://jsr.io/badges/@nick "View all of @nick's packages on jsr.io"
[badge-jsr-pkg]: https://jsr.io/badges/@nick/brocha "View @nick/brocha on jsr.io"
[badge-jsr-score]: https://jsr.io/badges/@nick/brocha/score "View the score for @nick/brocha on jsr.io"
[brotli]: https://github.com/google/brotli "View the Brotli project on GitHub"
[npm:brotli]: https://www.npmjs.com/package/brotli "View the brotli package on npm"
[npm:brocha]: https://www.npmjs.com/package/brocha "View the brocha package on npm"
[`BufferSource`]: https://developer.mozilla.org/en-US/docs/Web/API/BufferSource "MDN Web Docs: BufferSource"
