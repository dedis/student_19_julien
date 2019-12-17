import GfP12 from "./gfp12";
import { G1, G2, GT } from "./bn";
import TwistPoint from "./twist-point";
import CurvePoint from "./curve-point";
import GfP2 from "./gfp2";
import GfP6 from "./gfp6";
import { u, xiToPMinus1Over3, xiToPMinus1Over2, xiToPSquaredMinus1Over3, p } from "./constants";
import GfP, { GfPPool1 } from "./gfp";
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
    let I : GfP2 = GfPPool2.use()
    let E : GfP2 = GfPPool2.use()
    let J : GfP2 = GfPPool2.use()
    let rx : GfP2 = GfPPool2.use()
    let rt : GfP2 = GfPPool2.use()

    let a : GfP2 = new GfP2(0n, 0n)
    let c : GfP2 = new GfP2(0n, 0n)
    let b : GfP2 = new GfP2(0n, 0n)

    B.mul(p_1.getX(), r.getT());
    D.add(p_1.getY(), r.getZ()).square(D).sub(D, r2).sub(D, r.getT()).mul(D, r.getT());

    B.sub(B, r.getX());
    I.square(B);
    E.add(I, I).add(E, E);
    J.mul(B, E);
    D.sub(D, r.getY()).sub(D, r.getY());
    E.mul(r.getX(), E);

    rx.square(D).sub(rx, J).sub(rx, E).sub(rx, E).mod(rx, p);
    B.add(r.getZ(), B).square(B).sub(B, r.getT()).sub(B, I).mod(B, p);

    I.sub(E, rx).mul(I, D);
    E.mul(r.getY(), J).add(E, E);
    J.sub(I, E).mod(J, p);
    rt.square(B).mod(rt, p);

    I.add(p_1.getY(), B).square(I).sub(I, r2).sub(I, rt);
    E.mul(D, p_1.getX()).add(E, E);

    a.sub(E, I).mod(a, p);
    c.mulScalar(B, q.getY()).add(c, c).mod(c, p);
    
    b.sub(GfP2.zero(), D).mulScalar(b, q.getX()).add(b, b).mod(b, p);


    let rOut : TwistPoint = new TwistPoint(rx, J, B, rt)
    
    GfP2.release(B, D, I, E, J, rx, rt)

    return {
        a,
        b,
        c,
        rOut
    };
}

/**
 * See the doubling algorithm for a=0 from "Faster Computation of the
 * Tate Pairing", http://arxiv.org/pdf/0904.0854v3.pdf
 */
function lineFunctionDouble(r: TwistPoint, q: CurvePoint): Result {
    
    let C : GfP2 = GfPPool2.use()
    let D : GfP2 = GfPPool2.use()
    let E : GfP2 = GfPPool2.use()
    let G : GfP2 = GfPPool2.use()
    let rx : GfP2 = GfPPool2.use()
    let rz : GfP2 = GfPPool2.use()
    let rt : GfP2 = GfPPool2.use()

    let a : GfP2 = new GfP2(0n, 0n)
    let c : GfP2 = new GfP2(0n, 0n)
    let b : GfP2 = new GfP2(0n, 0n)

    c.square(r.getX());
    a.square(r.getY());
    C.square(a);
    D.add(r.getX(), a).square(D).sub(D, c).sub(D, C).add(D, D);

    E.add(c, c).add(E, c);
    G.square(E);

    rx.sub(G, D).sub(rx, D)
    rz.add(r.getY(), r.getZ()).square(rz).sub(rz, a).sub(rz, r.getT());
    D.sub(D, rx).mul(D, E);

    C.add(C, C).add(C, C).add(C, C);
    D.sub(D, C);

    rt.square(rz);

    C.mul(E, r.getT()).add(C, C);
    b.sub(GfP2.zero(), C).mulScalar(b, q.getX());
    C.add(a, a).add(C, C)
    a.add(r.getX(), E).square(a).sub(a, c).sub(a, G).sub(a, C);
    c.mul(rz, r.getT()).add(c, c).mulScalar(c, q.getY());

    let rOut : TwistPoint = new TwistPoint(rx, D, rz, rt)

    GfP2.release(C,D,E,G,rx,rt,rz)

    return {
        a,
        b,
        c,
        rOut
    };
}

function mulLine(ret: GfP12, res: Result): GfP12 {
    let a2 : GfP6 = GfPPool6.use()
    let t3 : GfP6 = GfPPool6.use()
    let t2 : GfP6 = GfPPool6.use()
    let tx : GfP6 = GfPPool6.use()

    a2.setX(GfP2.zero())
    a2.setY(res.a)
    a2.setZ(res.b)
    
    a2.mul(a2, ret.getX());
    t3.mulScalar(ret.getY(), res.c);
    t2.getZ().add(res.b, res.c);
    t2.setX(GfP2.zero())
    t2.setY(res.a)

    tx.add(ret.getX(), ret.getY()).mul(tx, t2).sub(tx, a2).sub(tx,t3).mod(tx, p);
    t3.add(t3, a2.mulTau(a2)).mod(t3, p);

    let gfp12: GfP12 = new GfP12(tx, t3)

    GfP6.release(a2, t3, t2, tx)

    return gfp12
}

/**
 * miller implements the Miller loop for calculating the Optimal Ate pairing.
 * See algorithm 1 from http://cryptojedi.org/papers/dclxvi-20100714.pdf
 */
function miller(q: TwistPoint, p: CurvePoint): GfP12 {
    let ret : GfP12 = GfPPool12.use()

    let r2 : GfP2 = GfPPool2.use()
    let qx : GfP2 = GfPPool2.use()
    let qy : GfP2 = GfPPool2.use()

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
    let tmp :GfP = GfPPool1.use()
    tmp.setValue(xiToPSquaredMinus1Over3)
    const minusQ2 = new TwistPoint(
        qx.mulScalar(aAffine.getX(),tmp),
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
    GfP.release(tmp)
    GfP2.release(qx, qy)
    return mulLine(ret, res2);
}

/**
 * finalExponentiation computes the (p¹²-1)/Order-th power of an element of
 * GF(p¹²) to obtain an element of GT (steps 13-15 of algorithm 1 from
 * http://cryptojedi.org/papers/dclxvi-20100714.pdf)
 */
function finalExponentiation(a: GfP12): GfP12 {
    
    let t1 : GfP12 = GfPPool12.use()
    let t2 : GfP12 = GfPPool12.use()
    let fp2 : GfP12 = GfPPool12.use()
    let fp3 : GfP12 = GfPPool12.use()
    let fu : GfP12 = GfPPool12.use()
    let fu2 : GfP12 = GfPPool12.use()
    let fu3 : GfP12 = GfPPool12.use()
    let fu2p : GfP12 = GfPPool12.use()
    let y3 : GfP12 = GfPPool12.use()

    t1.conjugate(a).mul(t1, t2.invert(a)).mod(t1, p);
    t2.frobeniusP2(t1);
    t1.mul(t1, t2).mod(t1, p);

    t2.frobenius(t1);
    fp2.frobeniusP2(t1);
    fp3.frobenius(fp2);

    fu.exp(t1, u).mod(fu, p);
    fu2.exp(fu, u).mod(fu2, p);
    fu3.exp(fu2, u).mod(fu3, p);
    fu2p.frobenius(fu2);
    
    t2.mul(t2, fp2).mul(t2, fp3).mod(t2, p);
    fp2.conjugate(t1);
    fp3.frobeniusP2(fu2);
    y3.frobenius(fu).conjugate(y3);
    fu.mul(fu, fu2p).conjugate(fu).mod(fu, p);
    fu2p.conjugate(fu2);
    fu2.mul(fu3, t1.frobenius(fu3)).conjugate(fu2).mod(fu2, p);

    fu3.square(fu2).mul(fu3, fu).mul(fu3, fu2p).mod(fu3, p);
    t1.mul(y3, fu2p).mul(t1, fu3).square(t1).mod(t1, p);
    fu3.mul(fu3, fp3).mod(fu3, p);
    t1.mul(t1, fu3).square(t1).mod(t1, p);
    fu3.mul(t1, fp2).mod(fu3, p);
    t1.mul(t1, t2).mod(t1, p);
    fu3.square(fu3).mul(fu3, t1).mod(fu3, p)

    let gfp12: GfP12 = new GfP12(fu3.getX(), fu3.getY())

    GfP12.release(t1,t2,fp2,fp3,fu,fu2,fu2p,y3,fu3)

    return gfp12
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