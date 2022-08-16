import bech32, { Bech32 } from './index';

describe('@spacemeshos/address-wasm', () => {
  let b32: Bech32;
  beforeAll(async () => {
    b32 = await bech32('sm');
  });

  const pubKey = Uint8Array.from([
    125, 44, 218, 64, 34, 174, 155, 203, 85, 178, 42, 154, 134, 113, 240, 191,
    212, 29, 209, 100, 78, 91, 133, 215, 219, 103, 73, 212, 109, 61, 53, 93,
  ]);

  it('getHRPNetwork(): string', async () => {
    const r = await b32.getHRPNetwork();
    expect(r).toEqual('sm');
  });
  describe('generateAddress', () => {
    it('returns Promise.Resolve<string> for valid public key', async () => {
      const r = await b32.generateAddress(pubKey);
      expect(r).toHaveLength(48);
      expect(r.startsWith).toBeTruthy();
    });
    it('returns Promise.Reject<Error> for invalid public key', async () => {
      await expect(() => b32.generateAddress(Uint8Array.from([]))).rejects.toThrow();
      await expect(() => b32.generateAddress(Uint8Array.from([0]))).rejects.toThrow();
      await expect(() => b32.generateAddress(Uint8Array.from([1,2,3]))).rejects.toThrow();
    });
  });
  describe('verifyAddress', () => {
    it('returns promise with the same address if it valid', async () => {
      const addr = await b32.generateAddress(pubKey);
      expect(await b32.verifyAddress(addr)).toEqual(addr);
    });
    it('returns rejected promise with error in other cases', async () => {
      await expect(
        () => b32.verifyAddress('sm123')
      ).rejects.toThrow(
        'error decode to bech32: invalid bech32 string length 5'
      );
      await expect(
        () => b32.verifyAddress('xx1qqqqqqyxw8ctl4qa69jyuku96ldkwjw5d57n2hg5zgdnf')
      ).rejects.toThrow(
        'error decode to bech32: invalid checksum (expected fpzy2y got 5zgdnf)'
      );
    });
    it('address become invalid after changing HRPNetwork', async () => {
      const addr = await b32.generateAddress(pubKey);
      expect(await b32.verifyAddress(addr)).toEqual(addr);
      b32.setHRPNetwork('test');
      await expect(
        () => b32.verifyAddress(addr)
      ).rejects.toThrow(
        "wrong network id: expected `test`, got `sm`: unsupported network"
      );
      b32.setHRPNetwork('sm');
      expect(await b32.verifyAddress(addr)).toEqual(addr);
    });
  });
});
