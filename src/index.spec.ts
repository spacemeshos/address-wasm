import bech32, { Bech32 } from './index';

describe('@spacemesh/address-wasm', () => {
  let b32: Bech32;
  beforeAll(async () => {
    b32 = await bech32('sm');
  });

  const pubKey = Uint8Array.from([
    125, 44, 218, 64, 34, 174, 155, 203, 85, 178, 42, 154, 134, 113, 240, 191,
    212, 29, 209, 100, 78, 91, 133, 215, 219, 103, 73, 212, 109, 61, 53, 93,
  ]);
  const pubKeyTrimmed = Uint8Array.from([
    0, 0, 0, 0,
    ...pubKey.slice(-20)
  ]);

  it('getHRPNetwork', () => {
    const r = b32.getHRPNetwork();
    expect(r).toEqual('sm');
  });
  it('setHRPNetwork', () => {
    const initial = 'sm';
    const next = 'stest';
    expect(b32.getHRPNetwork()).toEqual(initial);
    b32.setHRPNetwork(next);
    expect(b32.getHRPNetwork()).toEqual(next);
    b32.setHRPNetwork(initial);
    expect(b32.getHRPNetwork()).toEqual(initial);
  });
  describe('generateAddress', () => {
    describe('impure (unary call)', () => {
      it('returns address', () => {
        const r = b32.generateAddress(pubKey);
        expect(r).toHaveLength(48);
        expect(r.startsWith('sm1q')).toBeTruthy();
      });
      it('throws an Error for invalid public key', () => {
        expect(() => b32.generateAddress(Uint8Array.from([]))).toThrow();
        expect(() => b32.generateAddress(Uint8Array.from([0]))).toThrow();
        expect(() => b32.generateAddress(Uint8Array.from([1,2,3]))).toThrow();
      });
    });
    describe('pure (binary call)', () => {
      it('returns address', () => {
        const p = Uint8Array.from([0, 0, 0, 0, 107, 14, 132, 231, 192, 227, 195, 127, 55, 8, 231, 230, 122, 228, 173, 236, 117, 74, 243, 127]);
        b32.setHRPNetwork('sm');
        const r = b32.generateAddress(p, 'stest');
        expect(r).toEqual('stest1qqqqqqrtp6zw0s8rcdlnwz88ueawft0vw490xlc095s8l');
      });
      it('throws an Error for invalid public key', () => {
        expect(() => b32.generateAddress(Uint8Array.from([]), 'sm')).toThrow();
        expect(() => b32.generateAddress(Uint8Array.from([0]), 'sm')).toThrow();
        expect(() => b32.generateAddress(Uint8Array.from([1,2,3]), 'sm')).toThrow();
      });
    });
    it('golden', async () => {
      const p = Uint8Array.from([0, 0, 0, 0, 107, 14, 132, 231, 192, 227, 195, 127, 55, 8, 231, 230, 122, 228, 173, 236, 117, 74, 243, 127]);
      b32.setHRPNetwork('stest');
      const r = b32.generateAddress(p);
      b32.setHRPNetwork('sm');
      expect(r).toEqual('stest1qqqqqqrtp6zw0s8rcdlnwz88ueawft0vw490xlc095s8l');
      const rr = b32.generateAddress(p, 'stest');
      expect(rr).toEqual('stest1qqqqqqrtp6zw0s8rcdlnwz88ueawft0vw490xlc095s8l');
    });
  });
  describe('parse', () => {
    describe('impure (unary call)', () => {
      it('returns bytes', () => {
        const addr = b32.generateAddress(pubKey);
        expect(b32.parse(addr)).toEqual(pubKeyTrimmed);
      });
      it('throws error for invalid string length', () => {
        expect(
          () => b32.parse('sm123')
        ).toThrow(
          'error decode to bech32: invalid bech32 string length 5'
        );
      });
      it('throws error for invalid address', () => {
        expect(
          () => b32.parse('xx1qqqqqqyxw8ctl4qa69jyuku96ldkwjw5d57n2hg5zgdnf')
        ).toThrow(
          'error decode to bech32: invalid checksum (expected fpzy2y got 5zgdnf)'
        );
      });
      it('address become invalid after changing HRPNetwork', () => {
        const addr = b32.generateAddress(pubKey);
        expect(b32.parse(addr)).toEqual(pubKeyTrimmed);
        b32.setHRPNetwork('test');
        expect(
          () => b32.parse(addr)
        ).toThrow(
          "wrong network id: expected `test`, got `sm`: unsupported network"
        );
        b32.setHRPNetwork('sm');
        expect(b32.parse(addr)).toEqual(pubKeyTrimmed);
      });
    });
    describe('pure (binary call)', () => {
      it('returns bytes', () => {
        const addr = b32.generateAddress(pubKey, 'sm');
        expect(b32.parse(addr, 'sm')).toEqual(pubKeyTrimmed);
      });
      it('throws error for invalid string length', () => {
        expect(
          () => b32.parse('sm123', 'sm')
        ).toThrow(
          'error decode to bech32: invalid bech32 string length 5'
        );
      });
      it('throws error for invalid address', () => {
        expect(
          () => b32.parse('xx1qqqqqqyxw8ctl4qa69jyuku96ldkwjw5d57n2hg5zgdnf', 'sm')
        ).toThrow(
          'error decode to bech32: invalid checksum (expected fpzy2y got 5zgdnf)'
        );
      });
    });
  });
  describe('verify', () => {
    it('impure (unary call)', () => {
      expect(b32.verify('xx1qqqqqqyxw8ctl4qa69jyuku96ldkwjw5d57n2hg5zgdnf')).toBeFalsy();
      expect(b32.verify('stest1qqqqqqrtp6zw0s8rcdlnwz88ueawft0vw490xlc095s8l')).toBeFalsy();
      const addr = b32.generateAddress(pubKey);
      expect(b32.verify(addr)).toBeTruthy();
    });
    it('pure (binary call)', () => {
      expect(b32.verify('xx1qqqqqqyxw8ctl4qa69jyuku96ldkwjw5d57n2hg5zgdnf', 'sm')).toBeFalsy();
      const addr = b32.generateAddress(pubKey, 'stest');
      expect(b32.verify(addr, 'sm')).toBeFalsy();
      expect(b32.verify(addr, 'stest')).toBeTruthy();
      expect(b32.verify('stest1qqqqqqrtp6zw0s8rcdlnwz88ueawft0vw490xlc095s8l', 'stest')).toBeTruthy();
    });
  })
});
