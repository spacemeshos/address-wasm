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

const Bech32 = async (hrp: string) => {
  const _global = load();
  await runWasm(require('../build/main.inl.js'));
  _global.__setAddressConfig(hrp);

  return {
    setHRPNetwork: (hrp: string) =>
      new Promise<boolean>((resolve) =>
        _global.__setAddressConfig(hrp, resolve)
      ),
    generateAddress: (pubKey: Uint8Array) =>
      new Promise<string>((resolve, reject) => {
        if (!(pubKey instanceof Uint8Array) || pubKey.length !== 32) {
          return reject(
            new Error('Bech32.generateAddress requires publicKey represented as Uint8Array[32]')
          );
        }
        _global.__generateBech32Address(pubKey, resolve)
      }),
    getHRPNetwork: (): Promise<string> =>
      new Promise((resolve) =>
        _global.__getHRPNetwork(resolve)
      ),
  };
};
export default Bech32;

export type Bech32 = Awaited<ReturnType<typeof Bech32>>;
