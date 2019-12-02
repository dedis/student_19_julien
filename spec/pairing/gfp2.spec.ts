import GfP2 from '../../src/pairing/gfp2';
import GfP from '../../src/pairing/gfp';

describe('GfP2', () => {
    it('should generate one and zero', () => {
        const one = GfP2.one();
        const zero = GfP2.zero();

        expect(one.isOne()).toBeTruthy();
        expect(zero.isOne()).toBeFalsy();
        
        expect(zero.isZero()).toBeTruthy();
        expect(one.isZero()).toBeFalsy();
    });

    it('should invert', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let inv = new GfP2(new GfP(),new GfP())
        inv.invert(a);
        expect(a.equals(inv)).toBeFalsy();
        expect(inv.invert(inv).equals(a)).toBeTruthy();
        inv.invert(inv)
        expect(inv.mul(inv, a).equals(GfP2.one())).toBeTruthy();
    });

    it('should get the conjugate', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let c = new GfP2(new GfP(),new GfP())
        c.conjugate(a);
        expect(c.equals(a)).toBeFalsy();
        expect(c.conjugate(c).equals(a)).toBeTruthy();
    });

    it('should get the negative', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let n = new GfP2(new GfP(),new GfP())
        n.negative(a);

        expect(a.equals(n)).toBeFalsy();
        expect(n.negative(n).equals(a)).toBeTruthy();
    });

    it('should square', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let s = new GfP2(new GfP(),new GfP())
        s.square(a);
        let m = new GfP2(new GfP(),new GfP())
        m.mul(a, a);

        expect(s.equals(m)).toBeTruthy();
    });

    it('should multiply by a scalar', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let b = new GfP2(new GfP(),new GfP())
        let c = new GfP2(new GfP(),new GfP())

        b.mulScalar(a, new GfP(BigInt(3)));
        c.add(a, a).add(c, a);

        expect(b.equals(c)).toBeTruthy();
    });

    it('should subtract', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let b = new GfP2(new GfP(),new GfP())
        b.mulScalar(a, new GfP(BigInt(2))).sub(b, a);
        expect(a.equals(b)).toBeTruthy();
    });

    it('should stringify', () => {
        const one = GfP2.one();

        expect(one.toString()).toBe('(0,1)');
    });
});
