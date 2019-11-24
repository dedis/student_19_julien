import GfP12 from '../../src/pairing/gfp12';
import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'
import { GFpPool12 } from '../../src/pairing/gfpPool';


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
        const inv = a.invert().mod(p);
        let b : GfP12 = new GfP12()
        b.mul(inv, a)
        b = b.mod(p);

        expect(b.equals(GfP12.one())).toBeTruthy();
        expect(inv.invert().mod(p).equals(a)).toBeTruthy();
    });

    it('should square and multiply', () => {
        const s = a.square().square().mod(p);
        let m : GfP12 = GFpPool12.use()
        let n : GfP12 = GFpPool12.use()
        
        m.mul(a,a)
        n.mul(m,a)
        m.mul(n,a)
        m = m.mod(p)

        const e = a.exp(BigInt(4)).mod(p);

        expect(s.equals(m)).toBeTruthy();
        expect(s.equals(e)).toBeTruthy();
    });

    it('should add and subtract', () => {
        const aa = a.add(a);
        
        expect(aa.equals(a)).toBeFalsy();
        expect(aa.sub(a).equals(a)).toBeTruthy();
    });

    it('should get the negative and conjugate', () => {
        const n = a.neg();
        const c = a.conjugate();

        expect(n.neg().equals(a)).toBeTruthy();
        expect(c.conjugate().equals(a)).toBeTruthy();
    });

    it('should stringify', () => {
        const one = GfP12.one();
        expect(one.toString()).toBe('(((0,0), (0,0), (0,0)), ((0,0), (0,0), (0,1)))');
    });
});
