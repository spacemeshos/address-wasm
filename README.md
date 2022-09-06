## @spacemeshos/address-wasm

[![npm (scoped)](https://img.shields.io/npm/v/@spacemesh/address-wasm.svg)](https://www.npmjs.com/package/@spacemesh/address-wasm)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@spacemesh/address-wasm.svg)](https://www.npmjs.com/package/@spacemesh/address-wasm)

This package implements BECH32 address encoder and verifyier.

To start using the library you need to install it first:
```sh
yarn add @spacemesh/address-wasm
```

And then start using it in your code:
```js
import bech32 from '@spacemesh/address-wasm'

(async () => {
  // Initialize wasm
  // Init function requires an HRPNetwork string
  const b32 = await bech32('sm');
  // Get some public key
  const publicKey = Uint8Array.from([1, 2, 3, ..., 20]);
  // And generate address from it
  const addr = b32.generateAddress(publicKey);
  // You can also verify it
  console.log(b32.verify(addr)); // true
  // Then you can change HRP Network
  b32.setHRPNetwork('smtest');
  // And now previously generated address becomes ivalid,
  // because it refers to different HRP network
  console.log(b32.verify(addr)); // false
  // And get byte-representation of the address:
  console.log(b32.parse(addr)); // [0, 0, 0, 0, 1, 2, ..., 20]
})();

// You can also call `verify`, `parse`, `generateAddress` methods
// with second argument: HRP. Then it will behave like pure function.
console.log(b32.generateAddress(publicKey, 'sm')); // 'sm1q...'
console.log(b32.generateAddress(publicKey, 'stest')); // 'stest1q...'
console.log(b32.verify(someAddr, 'stest')); // true / false
```

### For contributors

This package contains wasm implementation on go-lang, that uses `spacemeshos/address` implementation inside.
Also, package includes javascript wrapper over wasm runner, that provides a clean facade for functions.

You will need installed Go (check out version in `go.mod`), NodeJS and yarn.
Then you can just type:
```
make
```

To run different build processes — check out Makefile. For example to build only wasm file you can run
```
make gen-wasm
```