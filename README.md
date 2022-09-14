## @spacemesh/address-wasm

[![npm (scoped)](https://img.shields.io/npm/v/@spacemesh/address-wasm.svg)](https://www.npmjs.com/package/@spacemesh/address-wasm)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@spacemesh/address-wasm.svg)](https://www.npmjs.com/package/@spacemesh/address-wasm)

This package implements BECH32 address encoder and verifyier.

To start using the library you need to install it first:
```sh
yarn add @spacemesh/address-wasm
```

And then start using it in your code:
```js
import Bech32 from '@spacemesh/address-wasm'

(async () => {
  // Initialize wasm
  // Init function requires an HRPNetwork string
  // It will be called automatically on calling any of methods
  // in case if it does not called before.
  Bech32.init();
  // Then you can setHRPNetwork:
  Bech32.setHRPNetwork('sm');

  // Get some public key
  const publicKey = Uint8Array.from([1, 2, 3, ..., 20]);
  // And generate address from it
  const addr = Bech32.generateAddress(publicKey);
  // You can also verify it
  console.log(Bech32.verify(addr)); // true
  // Then you can change HRP Network
  Bech32.setHRPNetwork('smtest');
  // And now previously generated address becomes ivalid,
  // because it refers to different HRP network
  console.log(Bech32.verify(addr)); // false
  // And get byte-representation of the address:
  console.log(Bech32.parse(addr)); // [0, 0, 0, 0, 1, 2, ..., 20]
})();

// You can also call `verify`, `parse`, `generateAddress` methods
// with second argument: HRP. Then it will behave like pure function.
console.log(Bech32.generateAddress(publicKey, 'sm')); // 'sm1q...'
console.log(Bech32.generateAddress(publicKey, 'stest')); // 'stest1q...'
console.log(Bech32.verify(someAddr, 'stest')); // true / false
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