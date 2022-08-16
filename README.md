## @spacemeshos/address-wasm

This package implements BECH32 address encoder and verifyier.

To start using the library you need to install it first:
```sh
yarn add @spacemeshos/address-wasm
```

And then start using it in your code:
```js
import bech32 from '@spacemeshos/address-wasm'

(async () => {
  // Initialize wasm
  // Init function requires an HRPNetwork string
  const b32 = await bech32('sm');
  // Get some public key
  const publicKey = Uint8Array.from([1, 2, 3, ..., 32]);
  // And generate address from it
  const addr = await b32.generateAddress(publicKey);
  // You can also verify it
  console.log(await b32.verify(addr)); // true
  // Then you can change HRP Network
  await b32.setHRPNetwork('smtest');
  // And now previously generated address becomes ivalid,
  // because it refers to different HRP network
  console.log(await b32.verify(addr)); // false
})();
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