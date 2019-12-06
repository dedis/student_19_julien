import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'
import GfP from '../../src/pairing/gfp';

describe('GfP6', () => {
    const a = new GfP6(
        new GfP2(BigInt("239487238491"), BigInt("2356249827341")),
        new GfP2(BigInt("082659782"), BigInt("182703523765")),
        new GfP2(BigInt("978236549263"), BigInt("64893242")),
    );

    it('should invert', () => {
        let inv: GfP6 = new GfP6()
        let b: GfP6 = new GfP6()
        let ainv : GfP6 = new GfP6()

        inv.invert(a);
        b.mul(inv, a)
        b.mod(b, p);

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
        let s: GfP6 = new GfP6()
        let m: GfP6 = new GfP6()        
        s.square(a)
        s.square(s)

        s.mod(s, p)

        m.mul(a, a)

        m.mul(m, a)
        m.mul(m, a)

        m.mod(m, p);
        expect(s.equals(a)).toBeFalsy();
        expect(s.equals(m)).toBeTruthy();
    });

    it('should negate', () => {
        let n: GfP6 = new GfP6()
        n.neg(a);
        expect(n.equals(a)).toBeFalsy();
        expect(n.neg(n).equals(a)).toBeTruthy();
    });

    it('should frobenius', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let result : GfP6 = new GfP6(new GfP2(BigInt("18124642797753990327701385494316493938656039577508409582829233895818921445537"), 
        BigInt("63176371102555900418615395030540483786148452706763246422491236552715082206836")),
        new GfP2(BigInt("56597659247022690698559320133077816354280679433340842274981941894493308593091"),
        BigInt("12018978604159003115990884228121426344652258324520016301486624064137105124471")), 
        new GfP2(BigInt(-5), BigInt(6)))
        
        expect(n.frobenius(n).equals(result)).toBeTruthy();
    });

    it('should frobeniusP2', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let result : GfP6 = new GfP6(new GfP2(BigInt("4985783334309134261147736404674766913742361673560802634030"), 
        BigInt("9971566668618268522295472809349533827484723347121605268060")),
        new GfP2(BigInt("195001649086939811183431966224152314445032865108844709974404350059910144313256"),
        BigInt("260002198782586414911242621632203085926710486811792946632539133413213525751008")), 
        new GfP2(BigInt(5), BigInt(6)))
        
        expect(n.frobeniusP2(n).equals(result)).toBeTruthy();
    });

    it('should multiply', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let result : GfP6 = new GfP6(new GfP2(BigInt(56), BigInt(21)), new GfP2(BigInt(91), BigInt(23)), new GfP2(BigInt(130), BigInt(21)))

        expect(n.mul(n, n).equals(result)).toBeTruthy();

    });

    it('should square only', () => {
        let s: GfP6 = new GfP6()
        let m: GfP6 = new GfP6()        

        s.square(a)

        m.mul(a, a)
        s.mod(s,p)
        m.mod(m, p);
        expect(s.equals(a)).toBeFalsy();
        expect(s.equals(m)).toBeTruthy();
    });

    it('should mulScalar', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let result : GfP6 = new GfP6(new GfP2(BigInt(56), BigInt(21)), new GfP2(BigInt(91), BigInt(23)), new GfP2(BigInt(130), BigInt(21)))

        expect(n.mul(n, n).equals(result)).toBeTruthy();

    });

    it('should mulScalar', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let mulS: GfP2 = new GfP2(BigInt(1), BigInt(2))
        let result : GfP6 = new GfP6(new GfP2(BigInt(4), BigInt(3)), new GfP2(BigInt(10), BigInt(5)), new GfP2(BigInt(16), BigInt(7)))

        expect(n.mulScalar(n, mulS).equals(result)).toBeTruthy();
    });

    it('should mulGfP', () => {
        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let mulS: GfP = new GfP(BigInt(2))
        let result : GfP6 = new GfP6(new GfP2(BigInt(2), BigInt(4)), new GfP2(BigInt(6), BigInt(8)), new GfP2(BigInt(10), BigInt(12)))
        expect(n.mulGfP(n, mulS).equals(result)).toBeTruthy();
    });

    it('should mulTau', () => {
        let m: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))

        let n: GfP6 = new GfP6(new GfP2(BigInt(1), BigInt(2)), new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)))
        let result : GfP6 = new GfP6(new GfP2(BigInt(3), BigInt(4)), new GfP2(BigInt(5), BigInt(6)), new GfP2(BigInt(5), BigInt(5)))        
        expect(n.mulTau(m).equals(result)).toBeTruthy();
    });


    it('should be ok', () => {
        let a1 = new GfP2(BigInt(2), BigInt(2))
        let a2 = new GfP2(BigInt(2), BigInt(2))
        let a3 = new GfP2(BigInt(2), BigInt(2))

        let b1 = new GfP2(BigInt(3), BigInt(3))
        let b2 = new GfP2(BigInt(3), BigInt(3))
        let b3 = new GfP2(BigInt(3), BigInt(3))

        let a_cp = new GfP6(a1, a2, a3)
        let b_cp = new GfP6(b1, b2, b3)

        let a = new GfP6()
        let b = new GfP6()

        a.copy(a_cp)
        b.copy(b_cp)

        let r1 = new GfP2(BigInt(2), BigInt(2))
        let r2 = new GfP2(BigInt(2), BigInt(2))
        let r3 = new GfP2(BigInt(2), BigInt(2))
        let result = new GfP6(r1, r2, r3)

        a.neg(a).neg(a)
        expect(a.equals(result)).toBeTruthy()

        a.frobenius(a)
        r1 = new GfP2(BigInt("61479572611929031958591943323323504954753224517927796502275731080760856923693"), 
        BigInt("18060952746522072900622589492015272376015200971496255968244032394721483154635"))
        r2 = new GfP2(BigInt("20333082938696529944666518337496278131972942519489589798370614331487014950688"), 
        BigInt("19058506721568449448775213427477412750486761989313236939456322230699945645765"))
        r3 = new GfP2(BigInt(-2), BigInt(2))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.frobeniusP2(a)
        r1 = new GfP2(BigInt("9971566668618268522295472809349533827484723347121605268060"), 
        BigInt("9971566668618268522295472809349533827484723347121605268060"))
        r2 = new GfP2(BigInt("130001099391293207455621310816101542963355243405896473316269566706606762875504"), 
        BigInt("130001099391293207455621310816101542963355243405896473316269566706606762875504"))
        r3 = new GfP2(BigInt(2), BigInt(2))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.add(a, b)
        r1 = new GfP2(BigInt(5), 
        BigInt(5))
        r2 = new GfP2(BigInt(5), 
        BigInt(5))
        r3 = new GfP2(BigInt(5), BigInt(5))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()

        a.sub(a, b)
        r1 = new GfP2(BigInt(2), 
        BigInt(2))
        r2 = new GfP2(BigInt(2), 
        BigInt(2))
        r3 = new GfP2(BigInt(2), BigInt(2))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mod(a, BigInt(2))
        r1 = new GfP2(BigInt(0), 
        BigInt(0))
        r2 = new GfP2(BigInt(0), 
        BigInt(0))
        r3 = new GfP2(BigInt(0), BigInt(0))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mul(a, b)
        r1 = new GfP2(BigInt(36), 
        BigInt(0))
        r2 = new GfP2(BigInt(60), 
        BigInt("65000549695646603732796438742359905742825358107623003571877145026864184071771"))
        r3 = new GfP2(BigInt(84), 
        BigInt("65000549695646603732796438742359905742825358107623003571877145026864184071759"))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulScalar(a, a1)
        r1 = new GfP2(BigInt(8), 
        BigInt(0))
        r2 = new GfP2(BigInt(8), 
        BigInt(0))
        r3 = new GfP2(BigInt(8), BigInt(0))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulGfP(a, new GfP(BigInt(2)))
        r1 = new GfP2(BigInt(4), 
        BigInt(4))
        r2 = new GfP2(BigInt(4), 
        BigInt(4))
        r3 = new GfP2(BigInt(4), BigInt(4))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulTau(a)
        r1 = new GfP2(BigInt(2), 
        BigInt(2))
        r2 = new GfP2(BigInt(2), 
        BigInt(2))
        r3 = new GfP2(BigInt(8), BigInt(4))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.square(a)
        r1 = new GfP2(BigInt(24), 
        BigInt(0))
        r2 = new GfP2(BigInt(40), 
        BigInt(-8))
        r3 = new GfP2(BigInt(56), BigInt(-16))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.invert(a)
        r1 = new GfP2(BigInt(0), 
        BigInt(0))
        r2 = new GfP2(BigInt("3250027484782330186639821937117995287141267905381150178593857251343209203589"), 
        BigInt("42250357302170292426317685182533938732836482769954952321720144267461719646659"))
        r3 = new GfP2(BigInt("61750522210864273546156616805241910455684090202241853393283287775520974868194"), 
        BigInt("22750192393476311306478753559825967009988875337668051250157000759402464425124"))
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)
    });

});
