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

  const stateless = <T>(action: (...args: any) => T, hrp: string) => (...args: any) => {
    const prevHrp = _global.__getHRPNetwork();
    _global.__setHRPNetwork(hrp);
    const r = action(...args);
    _global.__setHRPNetwork(prevHrp);
    return r;
  };

  const hrpOptional = <A, T>(action: (arg: A) => T) => (arg: A, hrp: string | null = null) => {
    if (hrp) {
      return stateless(action, hrp)(arg);
    }
    return action(arg);
  };

  return {
    setHRPNetwork: (hrp: string): void => _global.__setHRPNetwork(hrp),
    getHRPNetwork: (): string => _global.__getHRPNetwork(),
    generateAddress: hrpOptional((pubKey: Uint8Array): string => {
      if (pubKey?.length < 20) {
        throw new Error('20 bytes required to generate address');
      }
      return _global.__generateAddress(pubKey);
    }),
    verify: hrpOptional((addr: string): boolean => {
      const [err, res] = _global.__parse(addr);
      if (err) return false;
      return !!res;
    }),
    parse: hrpOptional((addr: string) => {
      const r = _global.__parse(addr);
      const [err, hex] = r;
      if (err) {
        throw new Error(err);
      }
      return hexToBytes(hex)
    }),
  };
};
export default Bech32;

export type Bech32 = Awaited<ReturnType<typeof Bech32>>;
