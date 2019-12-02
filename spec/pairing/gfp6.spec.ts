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
        console.log("SHOULD INVERT : A: "+a)
        let inv: GfP6 = new GfP6()
        let b: GfP6 = new GfP6()
        let ainv : GfP6 = new GfP6()

        inv.invert(a);

        console.log("Invert of A: "+inv)

        b.mul(inv, a)
        console.log("B : no mod "+b)
        b.mod(b, p);
        console.log("B :  mod "+b)

        
        expect(a.equals(ainv.invert(a).invert(ainv))).toBeTruthy();
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
        console.log("SQUARE AND MUL: A: "+a)
        let s: GfP6 = new GfP6()
        let m: GfP6 = new GfP6()        

        s.square(a)
        console.log("A square: "+ s)
        s.square(s)
        console.log("A squaresquare: "+ s)
        s.mod(s, p)
        console.log("A squaresquareMOD: "+ s)

        m.mul(a, a)
        console.log("A mul A: "+ m)

        m.mul(m, a)
        m.mul(m, a)
        console.log("A mul A MUL A MUL A: "+ m)

        m.mod(m, p);
        console.log("A mul A MUL A MUL A MOD P: "+ m)

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
