import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'
import GfP from '../../src/pairing/gfp';

describe('GfP6', () => {
    const a = new GfP6(
        new GfP2(239487238491n, 2356249827341n),
        new GfP2(82659782n, 182703523765n),
        new GfP2(978236549263n, 64893242n),
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
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let result : GfP6 = new GfP6(new GfP2(18124642797753990327701385494316493938656039577508409582829233895818921445537n, 
        63176371102555900418615395030540483786148452706763246422491236552715082206836n),
        new GfP2(56597659247022690698559320133077816354280679433340842274981941894493308593091n,
        12018978604159003115990884228121426344652258324520016301486624064137105124471n), 
        new GfP2(-5n, 6n))
        
        expect(n.frobenius(n).equals(result)).toBeTruthy();
    });

    it('should frobeniusP2', () => {
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let result : GfP6 = new GfP6(new GfP2(4985783334309134261147736404674766913742361673560802634030n, 
        9971566668618268522295472809349533827484723347121605268060n),
        new GfP2(195001649086939811183431966224152314445032865108844709974404350059910144313256n,
        260002198782586414911242621632203085926710486811792946632539133413213525751008n), 
        new GfP2(5n, 6n))
        
        expect(n.frobeniusP2(n).equals(result)).toBeTruthy();
    });

    it('should multiply', () => {
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let result : GfP6 = new GfP6(new GfP2(56n, 21n), new GfP2(91n, 23n), new GfP2(130n, 21n))

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
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let result : GfP6 = new GfP6(new GfP2(56n, 21n), new GfP2(91n, 23n), new GfP2(130n, 21n))

        expect(n.mul(n, n).equals(result)).toBeTruthy();

    });

    it('should mulScalar', () => {
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let mulS: GfP2 = new GfP2(1n, 2n)
        let result : GfP6 = new GfP6(new GfP2(4n, 3n), new GfP2(10n, 5n), new GfP2(16n, 7n))

        expect(n.mulScalar(n, mulS).equals(result)).toBeTruthy();
    });

    it('should mulGfP', () => {
        let n: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let mulS: GfP = new GfP(2n)
        let result: GfP6 = new GfP6(new GfP2(2n,4n), new GfP2(6n, 8n), new GfP2(10n, 12n))
        expect(n.mulGfP(n, mulS).equals(result)).toBeTruthy();
    });

    it('should mulTau', () => {
        let m: GfP6 = new GfP6(new GfP2(1n,2n), new GfP2(3n, 4n), new GfP2(5n, 6n))
        let result: GfP6 = new GfP6(new GfP2(3n,4n), new GfP2(5n, 6n), new GfP2(5n, 5n))
        expect(m.mulTau(m).equals(result)).toBeTruthy();
    });


    it('should be ok', () => {
        let a1 = new GfP2(2n, 2n)
        let a2 = new GfP2(2n, 2n)
        let a3 = new GfP2(2n, 2n)

        let b1 = new GfP2(3n, 3n)
        let b2 = new GfP2(3n, 3n)
        let b3 = new GfP2(3n, 3n)

        let a_cp = new GfP6(a1, a2, a3)
        let b_cp = new GfP6(b1, b2, b3)

        let a = new GfP6()
        let b = new GfP6()

        a.copy(a_cp)
        b.copy(b_cp)

        let r1 = new GfP2(2n, 2n)
        let r2 = new GfP2(2n, 2n)
        let r3 = new GfP2(2n, 2n)
        let result = new GfP6(r1, r2, r3)

        a.neg(a).neg(a)
        expect(a.equals(result)).toBeTruthy()

        a.frobenius(a)
        r1 = new GfP2(61479572611929031958591943323323504954753224517927796502275731080760856923693n, 
        18060952746522072900622589492015272376015200971496255968244032394721483154635n)
        r2 = new GfP2(20333082938696529944666518337496278131972942519489589798370614331487014950688n, 
        19058506721568449448775213427477412750486761989313236939456322230699945645765n)
        r3 = new GfP2(-2n, 2n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.frobeniusP2(a)
        r1 = new GfP2(9971566668618268522295472809349533827484723347121605268060n, 
        9971566668618268522295472809349533827484723347121605268060n)
        r2 = new GfP2(130001099391293207455621310816101542963355243405896473316269566706606762875504n, 
        130001099391293207455621310816101542963355243405896473316269566706606762875504n)
        r3 = new GfP2(2n, 2n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.add(a, b)
        r1 = new GfP2(5n,5n)
        r2 = new GfP2(5n,5n)
        r3 = new GfP2(5n,5n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()

        a.sub(a, b)
        r1 = new GfP2(2n, 2n)
        r2 = new GfP2(2n, 2n)
        r3 = new GfP2(2n, 2n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mod(a, 2n)
        r1 = new GfP2(0n, 0n)
        r2 = new GfP2(0n, 0n)
        r3 = new GfP2(0n, 0n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mul(a, b)
        r1 = new GfP2(36n,0n)
        r2 = new GfP2(60n, 
        65000549695646603732796438742359905742825358107623003571877145026864184071771n)
        r3 = new GfP2(84n, 
        65000549695646603732796438742359905742825358107623003571877145026864184071759n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulScalar(a, a1)
        r1 = new GfP2(8n,0n)
        r2 = new GfP2(8n,0n)
        r3 = new GfP2(8n,0n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulGfP(a, new GfP(2n))
        r1 = new GfP2(4n,4n)
        r2 = new GfP2(4n,4n)
        r3 = new GfP2(4n,4n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.mulTau(a)
        r1 = new GfP2(2n,2n)
        r2 = new GfP2(2n,2n)
        r3 = new GfP2(8n,4n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.square(a)
        r1 = new GfP2(24n,0n)
        r2 = new GfP2(40n,-8n)
        r3 = new GfP2(56n,-16n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.invert(a)
        r1 = new GfP2(0n, 0n)
        r2 = new GfP2(3250027484782330186639821937117995287141267905381150178593857251343209203589n, 
        42250357302170292426317685182533938732836482769954952321720144267461719646659n)
        r3 = new GfP2(61750522210864273546156616805241910455684090202241853393283287775520974868194n, 
        22750192393476311306478753559825967009988875337668051250157000759402464425124n)
        result = new GfP6(r1, r2, r3)
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)
    });

});
