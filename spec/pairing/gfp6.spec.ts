import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'

describe('GfP6', () => {
    const a = new GfP6(
        new GfP2(BigInt("239487238491"), BigInt("2356249827341")),
        new GfP2(BigInt("082659782"), BigInt("182703523765")),
        new GfP2(BigInt("978236549263"), BigInt("64893242")),
    );

    it('should invert', () => {
        const inv = a.invert();
        const b = inv.mul(a).mod(p);

        expect(a.equals(a.invert().invert())).toBeTruthy();
        expect(b.isOne()).toBeTruthy();

        const one = GfP6.one();
        expect(one.invert().equals(one)).toBeTruthy();
    });

    it('should add and subtract', () => {
        const b = a.add(a);
        const c = a.neg();

        expect(b.add(c).equals(a)).toBeTruthy();
        expect(b.sub(a).equals(a)).toBeTruthy();
    });

    it('should square and mul', () => {
        const s = a.square().square().mod(p);
        const m = a.mul(a).mul(a).mul(a).mod(p);

        expect(s.equals(a)).toBeFalsy();
        expect(s.equals(m)).toBeTruthy();
    });

    it('should negate', () => {
        const n = a.neg();

        expect(n.equals(a)).toBeFalsy();
        expect(n.neg().equals(a)).toBeTruthy();
    });
});
