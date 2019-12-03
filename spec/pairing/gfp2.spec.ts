import GfP2 from '../../src/pairing/gfp2';
import GfP from '../../src/pairing/gfp';
import { oneBI } from '../../src/constants';

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
        let inv = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        inv.invert(a);
        expect(a.equals(inv)).toBeFalsy();
        expect(inv.invert(inv).equals(a)).toBeTruthy();
        inv.invert(inv)
        expect(inv.mul(inv, a).equals(GfP2.one())).toBeTruthy();
    });

    it('should get the conjugate', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let c = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        c.conjugate(a);
        expect(c.equals(a)).toBeFalsy();
        expect(c.conjugate(c).equals(a)).toBeTruthy();
    });

    it('should get the negative', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let n = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        n.negative(a);

        expect(a.equals(n)).toBeFalsy();
        expect(n.negative(n).equals(a)).toBeTruthy();
    });

    it('should square', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let s = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        s.square(a);
        let m = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        m.mul(a, a);

        expect(s.equals(m)).toBeTruthy();
    });

    it('should multiply by a scalar', () => {
        const a = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let b = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        let c = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))

        b.mulScalar(a, new GfP(BigInt(3)));
        c.add(a, a).add(c, a);

        expect(b.equals(c)).toBeTruthy();
    });

    it('should subtract', () => {
        const aa = new GfP2(BigInt('23423492374'), BigInt('12934872398472394827398479'));
        let b = new GfP2(new GfP(BigInt(0)),new GfP(BigInt(0)))
        b.mulScalar(aa, new GfP(BigInt(2))).sub(b, aa);
        expect(aa.equals(b)).toBeTruthy();
    });

    it('should stringify', () => {
        const one = GfP2.one();

        expect(one.toString()).toBe('(0,1)');
    });

    it('should copy correctly', () => {
        let three = new GfP2(BigInt(3), BigInt(3))
        let three_cp = new GfP2(BigInt(0), BigInt(0))

        three_cp.copy(three)

        expect(three_cp.equals(three)).toBeTruthy()
        three = new GfP2(BigInt(4), BigInt(4))
        expect(three_cp.equals(three)).toBeFalsy()
    })

    it('should copy correctly with zeroBI and oneBI', () => {
        let three = new GfP2(BigInt(3), BigInt(3))
        let one = new GfP2(oneBI, oneBI)
        let one_cp = new GfP2(oneBI, oneBI)

        expect(one.equals(one_cp)).toBeTruthy()

        one.add(one, three)
        expect(one.equals(new GfP2(BigInt(4), BigInt(4)))).toBeTruthy()
        expect(one.equals(one_cp)).toBeFalsy()

    })

    it('should compute mulXi', () => {
        let aa = new GfP2(BigInt(2), BigInt(6))
        let result = new GfP2(BigInt(12), BigInt(16))
        expect(aa.mulXi(aa).equals(result)).toBeTruthy()
    });

});
