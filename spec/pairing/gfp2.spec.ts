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
        const a = new GfP2(23423492374n, 12934872398472394827398479n);
        let inv = new GfP2(new GfP(0n),new GfP(0n))
        inv.invert(a);
        expect(a.equals(inv)).toBeFalsy();
        expect(inv.invert(inv).equals(a)).toBeTruthy();
        inv.invert(inv)
        expect(inv.mul(inv, a).equals(GfP2.one())).toBeTruthy();
    });

    it('should get the conjugate', () => {
        const a = new GfP2(23423492374n, 12934872398472394827398479n);
        let c = new GfP2(new GfP(0n),new GfP(0n))
        c.conjugate(a);
        expect(c.equals(a)).toBeFalsy();
        expect(c.conjugate(c).equals(a)).toBeTruthy();
    });

    it('should get the negative', () => {
        const a = new GfP2(23423492374n, 12934872398472394827398479n);
        let n = new GfP2(new GfP(0n),new GfP(0n))
        n.negative(a);

        expect(a.equals(n)).toBeFalsy();
        expect(n.negative(n).equals(a)).toBeTruthy();
    });

    it('should square', () => {
        const a = new GfP2(23423492374n, 12934872398472394827398479n);
        let s = new GfP2(new GfP(0n),new GfP(0n))
        s.square(a);
        let m = new GfP2(new GfP(0n),new GfP(0n))
        m.mul(a, a);

        expect(s.equals(m)).toBeTruthy();
    });

    it('should multiply by a scalar', () => {
        const a = new GfP2(23423492374n, 12934872398472394827398479n);
        let b = new GfP2(new GfP(0n),new GfP(0n))
        let c = new GfP2(new GfP(0n),new GfP(0n))

        b.mulScalar(a, new GfP(3n));
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
        let three = new GfP2(3n, 3n)
        let three_cp = new GfP2(0n, 0n)

        three_cp.copy(three)

        expect(three_cp.equals(three)).toBeTruthy()
        three = new GfP2(4n, 4n)
        expect(three_cp.equals(three)).toBeFalsy()
    })

    it('should copy correctly with zeroBI and oneBI', () => {
        let three = new GfP2(3n, 3n)
        let one = new GfP2(oneBI, oneBI)
        let one_cp = new GfP2(oneBI, oneBI)

        expect(one.equals(one_cp)).toBeTruthy()

        one.add(one, three)
        expect(one.equals(new GfP2(4n, 4n))).toBeTruthy()
        expect(one.equals(one_cp)).toBeFalsy()

    })

    it('should compute mulXi', () => {
        let aa = new GfP2(2n, 6n)
        let result = new GfP2(12n, 16n)
        expect(aa.mulXi(aa).equals(result)).toBeTruthy()
    });

    it('should be ok', () => {
        let a = new GfP2(2n, 2n)
        let b = new GfP2(3n, 3n)

        a.conjugate(a).conjugate(a)
        expect(a.equals(new GfP2(2n, 2n))).toBeTruthy()

        a.negative(a).negative(a)
        expect(a.equals(new GfP2(2n, 2n))).toBeTruthy()

        a.add(a,b)
        expect(a.equals(new GfP2(5n, 5n))).toBeTruthy()

        a.sub(a, b)
        expect(a.equals(new GfP2(2n, 2n))).toBeTruthy()

        a.mul(a, b)
        expect(a.equals(new GfP2(12n, 0n))).toBeTruthy()

        a = new GfP2(2n, 2n)
        a.mulScalar(a, new GfP(2n))
        expect(a.equals(new GfP2(4n, 4n))).toBeTruthy()

        a = new GfP2(2n, 2n)
        a.mulXi(a)
        expect(a.equals(new GfP2(8n, 4n))).toBeTruthy()
        
        a = new GfP2(2n, 2n)
        a.square(a)
        expect(a.equals(new GfP2(8n, 0n))).toBeTruthy()

        a = new GfP2(2n, 2n)
        a.invert(a)
        expect(a.equals(new GfP2(48750412271734952799597329056769929307119018580717252678907858770148138053837n, 
       16250137423911650933199109685589976435706339526905750892969286256716046017946n))).toBeTruthy

        a = new GfP2(36n, 36n)
        a.mod(a, 34n)
        expect(a.equals(new GfP2(2n, 2n))).toBeTruthy()
    });

});
