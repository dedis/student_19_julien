import GfP12 from "./gfp12";
import { G1, G2, GT } from "./bn";
import TwistPoint from "./twist-point";
import CurvePoint from "./curve-point";
import GfP2 from "./gfp2";
import GfP6 from "./gfp6";
import { u, xiToPMinus1Over3, xiToPMinus1Over2, xiToPSquaredMinus1Over3, p } from "./constants";
import GfP from "./gfp";
import { GfPPool2 } from './gfp2'
import { GfPPool6 } from './gfp6'
import { GfPPool12 } from './gfp12'


const sixuPlus2NAF = [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 1];

/**
 * Results from the line functions
 */
interface Result {
    a: GfP2,
    b: GfP2,
    c: GfP2,
    rOut: TwistPoint,
}

/**
 * See the mixed addition algorithm from "Faster Computation of the
 * Tate Pairing", http://arxiv.org/pdf/0904.0854v3.pdf
 */
function lineFunctionAdd(r: TwistPoint, p_1: TwistPoint, q: CurvePoint, r2: GfP2): Result {
    let B : GfP2 = GfPPool2.use()
    let D : GfP2 = GfPPool2.use()
    let H : GfP2 = GfPPool2.use()
    let I : GfP2 = GfPPool2.use()
    let E : GfP2 = GfPPool2.use()
    let J : GfP2 = GfPPool2.use()
    let L1 : GfP2 = GfPPool2.use()
    let V : GfP2 = GfPPool2.use()
    let rx : GfP2 = GfPPool2.use()
    let ry : GfP2 = GfPPool2.use()
    let rz : GfP2 = GfPPool2.use()
    let rt : GfP2 = GfPPool2.use()
    let t : GfP2 = GfPPool2.use()
    let t2 : GfP2 = GfPPool2.use()

    let atmp : GfP2 = GfPPool2.use()
    let ctmp : GfP2 = GfPPool2.use()
    let btmp : GfP2 = GfPPool2.use()

    B.mul(p_1.getX(), r.getT());
    D.add(p_1.getY(), r.getZ()).square(D).sub(D, r2).sub(D, r.getT()).mul(D, r.getT());

    H.sub(B, r.getX());
    I.square(H);
    E.add(I, I);
    E.add(E, E);
    J.mul(H, E);

    L1.sub(D, r.getY()).sub(D, r.getY());
    V.mul(r.getX(), E);

    rx.square(L1).sub(rx, J).sub(rx, V).sub(rx, V).mod(rx, p);
    rz.add(r.getZ(), H).square(rz).sub(rz, r.getT()).sub(rz, I).mod(rz, p);
    
    t.sub(V, rx).mul(t, L1);
    t2.mul(r.getY(), J)
    t2.add(t2, t2);
    ry.sub(t, t2).mod(ry, p);
    rt.square(rz).mod(rt, p);

    t.add(p_1.getY(), rz).square(t).sub(t, r2).sub(t, rt);
    t2.mul(L1, p_1.getX());
    t2.add(t2, t2);

    atmp.sub(t2, t).mod(atmp, p);
    ctmp.mulScalar(rz, q.getY());
    ctmp.add(ctmp, ctmp).mod(ctmp, p);

    btmp.sub(GfP2.zero(), L1).mulScalar(btmp, q.getX());
    btmp.add(btmp, btmp).mod(btmp, p);

    let a : GfP2 = GfPPool2.use()
    let c : GfP2 = GfPPool2.use()
    let b : GfP2 = GfPPool2.use()
    
    a.copy(atmp)
    b.copy(btmp)
    c.copy(ctmp)

    GfP2.release(B, D, H, I, E, J, L1, V, rx, ry, rz, rt, t, t2, atmp, ctmp, btmp)

    return {
        a,
        b,
        c,
        rOut: new TwistPoint(rx, ry, rz, rt),
    };
}

/**
 * See the doubling algorithm for a=0 from "Faster Computation of the
 * Tate Pairing", http://arxiv.org/pdf/0904.0854v3.pdf
 */
function lineFunctionDouble(r: TwistPoint, q: CurvePoint): Result {

    let A : GfP2 = GfPPool2.use()
    let B : GfP2 = GfPPool2.use()
    let C : GfP2 = GfPPool2.use()
    let D : GfP2 = GfPPool2.use()
    let E : GfP2 = GfPPool2.use()
    let G : GfP2 = GfPPool2.use()
    let rx : GfP2 = GfPPool2.use()
    let ry : GfP2 = GfPPool2.use()
    let rz : GfP2 = GfPPool2.use()
    let rt : GfP2 = GfPPool2.use()
    let t : GfP2 = GfPPool2.use()

    let atmp : GfP2 = GfPPool2.use()
    let ctmp : GfP2 = GfPPool2.use()
    let btmp : GfP2 = GfPPool2.use()


    A.square(r.getX());
    B.square(r.getY());
    C.square(B);
    D.add(r.getX(), B).square(D).sub(D, A).sub(D, C);
    D.add(D, D);

    E.add(A, A).add(E, A);
    G.square(E);

    rx.sub(G, D).sub(rx, D)
    rz.add(r.getY(), r.getZ()).square(rz).sub(rz, B).sub(rz, r.getT());
    ry.sub(D, rx).mul(ry, E);

    t.add(C, C)
    t.add(t, t);
    t.add(t, t);
    ry.sub(ry, t);

    rt.square(rz);

    t.mul(E, r.getT());
    t.add(t, t);
    btmp.sub(GfP2.zero(), t).mulScalar(btmp, q.getX());
    t.add(B, B)
    t.add(t, t)
    atmp.add(r.getX(), E).square(atmp).sub(atmp, A).sub(atmp, G).sub(atmp, t);
    ctmp.mul(rz, r.getT());
    ctmp.add(ctmp, ctmp).mulScalar(ctmp, q.getY());

    let a : GfP2 = GfPPool2.use()
    let c : GfP2 = GfPPool2.use()
    let b : GfP2 = GfPPool2.use()

    a.copy(atmp)
    b.copy(btmp)
    c.copy(ctmp)
    GfP2.release(A,B,C,D,E,G,rx,ry,rt,rz,t, atmp, btmp, ctmp)

    return {
        a,
        b,
        c,
        rOut: new TwistPoint(rx, ry, rz, rt),
    };
}

function mulLine(ret: GfP12, res: Result): GfP12 {
    let a1 : GfP6 = GfPPool6.use()
    let a2 : GfP6 = GfPPool6.use()
    let t3 : GfP6 = GfPPool6.use()
    let t : GfP2 = GfPPool2.use()
    let t2 : GfP6 = GfPPool6.use()
    let tx : GfP6 = GfPPool6.use()
    let ty : GfP6 = GfPPool6.use()

    a2.mul(new GfP6(GfP2.zero(), res.a, res.b), ret.getX());
    t3.mulScalar(ret.getY(), res.c);

    t.add(res.b, res.c);
    t2 = new GfP6(GfP2.zero(), res.a, t);
    
    tx.copy(tx.add(ret.getX(), ret.getY()).mul(tx, t2).sub(tx, a2).sub(tx,t3).mod(tx, p));
    ty.copy(ty.add(t3, a1.mulTau(a2)).mod(ty, p));
    GfP6.release(a1, a2, t3, t2, tx, ty)
    GfP2.release(t)
    return new GfP12(tx, ty);
}

/**
 * miller implements the Miller loop for calculating the Optimal Ate pairing.
 * See algorithm 1 from http://cryptojedi.org/papers/dclxvi-20100714.pdf
 */
function miller(q: TwistPoint, p: CurvePoint): GfP12 {

    //none are released! Check if it is ok
    let ret : GfP12 = GfPPool12.use()
    let r2 : GfP2 = GfPPool2.use()
    let qx : GfP2 = GfPPool2.use()
    let qy : GfP2 = GfPPool2.use()
    let q2x : GfP2 = GfPPool2.use()


    ret = GfP12.one();

    const aAffine = q.clone();
    aAffine.makeAffine();

    const bAffine = p.clone();
    bAffine.makeAffine();

    const minusA = new TwistPoint();
    minusA.neg(aAffine);

    let r = aAffine.clone();
    r2.square(aAffine.getY());

    for (let i = sixuPlus2NAF.length - 1; i > 0; i--) {
        let res = lineFunctionDouble(r, bAffine);
        if (i != sixuPlus2NAF.length - 1) {
            ret.square(ret);
        }

        ret = mulLine(ret, res);
        r = res.rOut;

        if (sixuPlus2NAF[i - 1] == 1) {
            res = lineFunctionAdd(r, aAffine, bAffine, r2);
        } else if (sixuPlus2NAF[i - 1] == -1) {
            res = lineFunctionAdd(r, minusA, bAffine, r2);
        } else {
            continue;
        }

        ret = mulLine(ret, res);
        r = res.rOut;
    }

    const q1 = new TwistPoint(
        qx.conjugate(aAffine.getX()).mul(qx, xiToPMinus1Over3),
        qy.conjugate(aAffine.getY()).mul(qy, xiToPMinus1Over2),
        GfP2.one(),
        GfP2.one(),
    );

    const minusQ2 = new TwistPoint(
        q2x.mulScalar(aAffine.getX(),new GfP(xiToPSquaredMinus1Over3)),
        aAffine.getY(),
        GfP2.one(),
        GfP2.one(),
    );

    r2.square(q1.getY());
    const res = lineFunctionAdd(r, q1, bAffine, r2);
    ret = mulLine(ret, res);
    r = res.rOut;

    r2.square(minusQ2.getY());
    const res2 = lineFunctionAdd(r, minusQ2, bAffine, r2);
    return mulLine(ret, res2);
}

/**
 * finalExponentiation computes the (p¹²-1)/Order-th power of an element of
 * GF(p¹²) to obtain an element of GT (steps 13-15 of algorithm 1 from
 * http://cryptojedi.org/papers/dclxvi-20100714.pdf)
 */
function finalExponentiation(a: GfP12): GfP12 {
    
    let t0 : GfP12 = GfPPool12.use()
    let t1 : GfP12 = GfPPool12.use()
    let t2 : GfP12 = GfPPool12.use()
    let fp : GfP12 = GfPPool12.use()
    let fp2 : GfP12 = GfPPool12.use()
    let fp3 : GfP12 = GfPPool12.use()
    let fu : GfP12 = GfPPool12.use()
    let fu2 : GfP12 = GfPPool12.use()
    let fu3 : GfP12 = GfPPool12.use()
    let fu2p : GfP12 = GfPPool12.use()
    let fu3p : GfP12 = GfPPool12.use()

    let y0 : GfP12 = GfPPool12.use()
    let y1 : GfP12 = GfPPool12.use()
    let y2 : GfP12 = GfPPool12.use()
    let y3 : GfP12 = GfPPool12.use()
    let y4 : GfP12 = GfPPool12.use()
    let y5 : GfP12 = GfPPool12.use()
    let y6 : GfP12 = GfPPool12.use()

    t1.conjugate(a);

    t1.mul(t1, t2.invert(a)).mod(t1, p);
    t2.frobeniusP2(t1);
    t1.mul(t1, t2).mod(t1, p);

    fp.frobenius(t1);
    fp2.frobeniusP2(t1);
    fp3.frobenius(fp2);

    fu.exp(t1, u).mod(fu, p);
    fu2.exp(fu, u).mod(fu2, p);
    fu3.exp(fu2, u).mod(fu3, p);
    fu2p.frobenius(fu2);
    fu3p.frobenius(fu3)     
    
    y0.mul(fp, fp2).mul(y0, fp3).mod(y0, p);
    y1.conjugate(t1);
    y2.frobeniusP2(fu2);
    y3.frobenius(fu).conjugate(y3);
    y4.mul(fu, fu2p).conjugate(y4).mod(y4, p);
    y5.conjugate(fu2);
    y6.mul(fu3, fu3p).conjugate(y6).mod(y6, p);

    t0.square(y6).mul(t0, y4).mul(t0, y5).mod(t0, p);
    t1.mul(y3, y5).mul(t1, t0).square(t1).mod(t1, p);
    t0.mul(t0, y2).mod(t0, p);
    t1.mul(t1, t0).square(t1).mod(t1, p);
    t0.mul(t1, y1).mod(t0, p);
    t1.mul(t1, y0).mod(t1, p);
    t0.copy(t0.square(t0).mul(t0, t1).mod(t0, p))

    GfP12.release(t1,t2,fp,fp2,fp3,fu,fu2,fu3,fu2p,fu3p,y0,y1,y2,y3,y4,y5,y6)

    return t0
}

/**
 * Compute the pairing between a point in G1 and a point in G2
 * using the Optimal Ate algorithm
 * @param g1 the point in G1
 * @param g2 the point in G2
 * @returns the resulting point in GT
 */
export function optimalAte(g1: G1, g2: G2): GT {
    const e = miller(g2.getPoint(), g1.getPoint());
    const ret = finalExponentiation(e);

    if (g1.isInfinity() || g2.isInfinity()) {
        return new GT(GfP12.one());
    }

    return new GT(ret);
}