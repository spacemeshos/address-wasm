// TODO: Isolate context into worker thread
const load = () => {
  require('../polyfill.wasm.js');
  require('../build/wasm_exec.js');
  return global;
};

const runWasm = async (wasmBytes: () => Uint8Array) => {
  const bytes = wasmBytes() as Uint8Array;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const go = new (global as any).Go();
  const { instance } = await WebAssembly.instantiate(
    bytes.buffer,
    go.importObject
  );
  go.run(instance);
  return go;
};

const hexToBytes = (hex: string): Uint8Array => {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substring(c, c + 2), 16));
  return Uint8Array.from(bytes);
};

const Bech32 = async (hrp: string) => {
  const _global = load();
  await runWasm(require('../build/main.inl.js'));
  _global.__setHRPNetwork(hrp);

  return {
    setHRPNetwork: (hrp: string): void => _global.__setHRPNetwork(hrp),
    getHRPNetwork: () => _global.__getHRPNetwork(),
    generateAddress: (pubKey: Uint8Array) => {
      if (pubKey?.length < 20) {
        throw new Error('20 bytes required to generate address');
      }
      return _global.__generateAddress(pubKey);
    },
    verify: (addr: string) => _global.__parse(addr),
    parse: (addr: string) => {
      const r = _global.__parse(addr);
      const [err, hex] = r;
      if (err) {
        throw new Error(err);
      }
      return hexToBytes(hex)
    },
  };
};
export default Bech32;

export type Bech32 = Awaited<ReturnType<typeof Bech32>>;
