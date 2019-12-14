import CurvePoint from '../../src/pairing/curve-point';
import { order } from '../../src/pairing/constants';
import GfP from '../../src/pairing/gfp';

describe('BN256 Curve Point', () => {
    it('should add one', () => {
        const one = new CurvePoint();
        one.mul(CurvePoint.generator(), 1n);

        const g = new CurvePoint();
        g.mul(CurvePoint.generator(), order);

        expect(g.isInfinity()).toBeTruthy();

        g.add(g, one);

        g.makeAffine();

        expect(g.equals(one)).toBeTruthy();
        expect(g.isOnCurve()).toBeTruthy();
        expect(one.isOnCurve()).toBeTruthy();

    });

    it('should add and double', () => {
        const a = new CurvePoint();
        a.mul(CurvePoint.generator(), 123456789n);

        const aa = new CurvePoint();
        aa.add(a, a);

        const d = new CurvePoint();
        d.dbl(a);

        expect(aa.getX().equals(d.getX())).toBeTruthy();
        expect(aa.getY().equals(d.getY())).toBeTruthy();
    });

    it('should add infinity', () => { //pass
        const inf = new CurvePoint();
        inf.setInfinity();
        expect(inf.isInfinity()).toBeTruthy();

        const one = new CurvePoint();
        one.mul(CurvePoint.generator(), 1n);

        const t = new CurvePoint();
        t.add(inf, one);
        expect(t.getX().equals(one.getX())).toBeTruthy();
        expect(t.getY().equals(one.getY())).toBeTruthy();

        t.add(one, inf);
        expect(t.getX().equals(one.getX())).toBeTruthy();
        expect(t.getY().equals(one.getY())).toBeTruthy();
    });

    it('should make basic operations', () => { //pass
        const g = new CurvePoint();
        g.copy(CurvePoint.generator());

        const x = 32498273234n;
        const X = new CurvePoint()
        X.mul(g, x);

        const y = 98732423523n;
        const Y = new CurvePoint()
        Y.mul(g, y);

        const s1 = new CurvePoint()
        s1.mul(X, y);
        s1.makeAffine();

        const s2 = new CurvePoint();
        s2.mul(Y, x);
        s2.makeAffine();

        expect(s1.getX().compareTo(s2.getX())).toBe(0);
        expect(s2.getX().compareTo(s1.getX())).toBe(0);
    });

    it('should negate the point', () => {
        const p = new CurvePoint();
        p.mul(CurvePoint.generator(), 12345n);

        const np = new CurvePoint();
        np.negative(p);

        expect(p.getY().equals(np.getY())).toBeFalsy();

        const nnp = new CurvePoint();
        nnp.negative(np);
        expect(p.getX().equals(nnp.getX())).toBeTruthy();
        expect(p.getY().equals(nnp.getY())).toBeTruthy();
    });

    it('should make the point affine', () => { //pass
        const p = new CurvePoint();
        p.makeAffine();
        expect(p.isInfinity()).toBeTruthy();
    });

    it('should test the equality', () => {  //pass
        const p = new CurvePoint();
        p.mul(CurvePoint.generator(), 123n);

        const p2 = new CurvePoint();
        p2.mul(CurvePoint.generator(), 123n);

        const p3 = new CurvePoint();
        p3.mul(CurvePoint.generator(), 12n);

        expect(p.equals(p)).toBeTruthy();
        expect(p.equals(p2)).toBeTruthy();
        expect(p3.equals(p)).toBeFalsy();
        expect(p.equals(null)).toBeFalsy();
    });

    it('should stringify', () => { //pass
        const p = new CurvePoint();
        p.setInfinity();

        expect(p.toString()).toBe('(0,1)');
    });
    
    it('should add only', () => {
        const one = new CurvePoint();
        one.mul(CurvePoint.generator(), 1n);
        let a = new CurvePoint()
        a.add(one,one) 
        expect(a.getX().getValue() == 65000549695646603732796438742359905742825358107623003571877145026864184071760n).toBeTruthy()
        expect(a.getY().getValue() == 65000549695646603732796438742359905742825358107623003571877145026864184071772n).toBeTruthy()

    });


    it('should double only', () => {
        let one = new CurvePoint();
        
        one.mul(CurvePoint.generator(), 1n);
        let a = new CurvePoint()

        a.dbl(one)  

        expect(a.getX().getValue() == 65000549695646603732796438742359905742825358107623003571877145026864184071760n).toBeTruthy()
        expect(a.getY().getValue() == 65000549695646603732796438742359905742825358107623003571877145026864184071772n).toBeTruthy()
    });

    it('should double add equal', () => {
        const one = new CurvePoint();
        
        one.mul(CurvePoint.generator(), 1n);
        let a = new CurvePoint()
        a.dbl(one)  
        let b = new CurvePoint()
        b.add(one, one)
        expect(a.equals(b)).toBeTruthy()
    });
});
