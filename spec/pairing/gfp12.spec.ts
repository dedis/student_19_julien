import GfP12 from '../../src/pairing/gfp12';
import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'


describe('GfP12', () => {
    const a = new GfP12(
        new GfP6(
            new GfP2(BigInt("239846234862342323958623"), BigInt("2359862352529835623")),
            new GfP2(BigInt("928836523"), BigInt("9856234")),
            new GfP2(BigInt("235635286"), BigInt("5628392833")),
        ),
        new GfP6(
            new GfP2(BigInt("252936598265329856238956532167968"), BigInt("23596239865236954178968")),
            new GfP2(BigInt("95421692834"), BigInt("236548")),
            new GfP2(BigInt("924523"), BigInt("12954623")),
        ),
    );

    it('should generate one and zero', () => {
        const one = GfP12.one();
        const zero = GfP12.zero();

        expect(one.isOne()).toBeTruthy();
        expect(one.isZero()).toBeFalsy();

        expect(zero.isZero()).toBeTruthy();
        expect(zero.isOne()).toBeFalsy();
    });

    it('should invert', () => {
        let inv: GfP12 = new GfP12()
        let b: GfP12 = new GfP12()

        inv.invert(a).mod(inv, p);
        b.mul(inv, a)
        b.mod(b, p);

        expect(b.equals(GfP12.one())).toBeTruthy();
        expect(inv.invert(inv).mod(inv, p).equals(a)).toBeTruthy();
    });

    it('should square and multiply', () => {
        let s: GfP12 = new GfP12()
        let m: GfP12 = new GfP12()
        let e: GfP12 = new GfP12()

        s.square(a).square(s).mod(s, p);
        m.mul(a,a).mul(m, a).mul(m, a).mod(m, p)

        e.exp(a, BigInt(4)).mod(e, p);

        expect(s.equals(m)).toBeTruthy();
        expect(s.equals(e)).toBeTruthy();
    });

    it('should add and subtract', () => {
        let aa: GfP12 = new GfP12()

        aa.add(a, a);
        
        expect(aa.equals(a)).toBeFalsy();
        expect(aa.sub(aa, a).equals(a)).toBeTruthy();
    });

    it('should get the negative and conjugate', () => {
        let n: GfP12 = new GfP12()
        let c: GfP12 = new GfP12()

        n.neg(a);
        c. conjugate(a);

        expect(n.neg(n).equals(a)).toBeTruthy();
        expect(c.conjugate(c).equals(a)).toBeTruthy();
    });

    it('should stringify', () => {
        const one = GfP12.one();
        expect(one.toString()).toBe('(((0,0), (0,0), (0,0)), ((0,0), (0,0), (0,1)))');
    });
});
