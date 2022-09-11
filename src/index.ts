// TODO: Isolate context into worker thread
const load = () => {
  require('../polyfill.wasm.js');
  require('../build/wasm_exec.js');
  return global;
};

declare global {
  var Go: {
    new(): {
      run: (instance: WebAssembly.Instance) => void;
      importObject: WebAssembly.Imports;
    }
  }
}

const runWasm = (wasmBytes: () => Uint8Array) => {
  const bytes = wasmBytes() as Uint8Array;
  const go = new global.Go();
  const mod = new WebAssembly.Module(bytes.buffer);
  const instance = new WebAssembly.Instance(mod, go.importObject);
  go.run(instance);
  return instance;
};

const hexToBytes = (hex: string): Uint8Array => {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substring(c, c + 2), 16));
  return Uint8Array.from(bytes);
};

const stateless = <T>(action: (...args: any) => T, hrp: string) => (...args: any) => {
  const prevHrp = Bech32.getHRPNetwork();
  Bech32.setHRPNetwork(hrp);
  const r = action(...args);
  Bech32.setHRPNetwork(prevHrp);
  return r;
};

const hrpOptional = <A, T>(action: (arg: A) => T) => (arg: A, hrp: string | null = null) => {
  if (hrp) {
    return stateless(action, hrp)(arg);
  }
  return action(arg);
};

class Bech32 {
  static init() {
    load();
    runWasm(require('../build/main.inl.js'));
  }
  static setHRPNetwork = (hrp: string) => global.__setHRPNetwork(hrp)

  static getHRPNetwork = () => global.__getHRPNetwork()

  static generateAddress = hrpOptional((pubKey: Uint8Array): string => {
    if (pubKey?.length < 20) {
      throw new Error('20 bytes required to generate address');
    }
    return global.__generateAddress(pubKey);
  })

  static verify = hrpOptional((addr: string): boolean => {
    const [err, res] = global.__parse(addr);
    if (err) return false;
    return !!res;
  })

  static parse = hrpOptional((addr: string) => {
    const r = global.__parse(addr);
    const [err, hex] = r;
    if (err) {
      throw new Error(err);
    }
    return hexToBytes(hex)
  })
}

export default Bech32;
