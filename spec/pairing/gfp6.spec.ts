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
        let inv: GfP6 = new GfP6()
        let b: GfP6 = new GfP6()

        inv.invert(a);
        b.mul(inv, a).mod(b, p);

        expect(a.equals(a.invert(a).invert(a))).toBeTruthy();
        expect(b.isOne()).toBeTruthy();

        const one = GfP6.one();
        expect(inv.invert(one).equals(one)).toBeTruthy();
    });

    it('should add and subtract', () => {
        let c: GfP6 = new GfP6()
        let b: GfP6 = new GfP6()        
        let tmp: GfP6 = new GfP6()

        b.add(a, a);
        c.neg(a);

        expect(tmp.add(b, c).equals(a)).toBeTruthy();
        expect(b.sub(b, a).equals(a)).toBeTruthy();
    });

    it('should square and mul', () => {
        let s: GfP6 = new GfP6()
        let m: GfP6 = new GfP6()        
        let tmp: GfP6 = new GfP6()

        s.square(a).square(s).mod(s, p);
        m.mul(a, a).mul(m, a).mul(m, a).mod(m, p);

        expect(s.equals(a)).toBeFalsy();
        expect(s.equals(m)).toBeTruthy();
    });

    it('should negate', () => {
        let n: GfP6 = new GfP6()
        n.neg(a);

        expect(n.equals(a)).toBeFalsy();
        expect(n.neg(n).equals(a)).toBeTruthy();
    });
});
