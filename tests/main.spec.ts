import bech32, { Bech32 } from '../src/index';

describe('@spacemeshos/address-wasm', () => {
  let b32: Bech32;
  beforeAll(async () => {
    b32 = await bech32('sm');
  });

  const pubKey = Uint8Array.from([
    125, 44, 218, 64, 34, 174, 155, 203, 85, 178, 42, 154, 134, 113, 240, 191,
    212, 29, 209, 100, 78, 91, 133, 215, 219, 103, 73, 212, 109, 61, 53, 93,
  ]);

  describe('generateAddress', () => {
    it('returns Promise.Resolve<string> for valid public key', async () => {
      const r = await b32.generateAddress(pubKey);
      expect(r).toHaveLength(48);
      expect(r.startsWith).toBeTruthy();
    });
    it('returns Promise.Reject<Error> for invalid public key', () => {
      expect(() => b32.generateAddress(Uint8Array.from([]))).rejects.toThrow();
      expect(() => b32.generateAddress(Uint8Array.from([0]))).rejects.toThrow();
      expect(() => b32.generateAddress(Uint8Array.from([1,2,3]))).rejects.toThrow();
    });
  });
  describe('setHRPNetwork', () => {});
  describe('getHRPNetwork', () => {});
});
